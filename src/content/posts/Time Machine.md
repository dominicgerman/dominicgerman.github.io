---
title: Time Machine
pubDate: 2026-01-14
tags:
  - homelab
draft: false
---
# Time Machine

In the past, I have had issues using Samba shares on my NAS as backup targets for Time Machine. Here's the guide I used to set it up.

## Avahi

---
MacOS will not use SMB Time Machine shares unless they are advertised via Bonjour mDNS.

```sh
apt install avahi-daemon -y && systemctl enable --now avahi-daemon
```

Create the Time Machine service file at `/etc/avahi/services/smb-time-machine.service` and then restart the Avahi daemon.

```xml
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
<name replace-wildcards="yes">%h Time Machine</name>
<service>
    <type>_adisk._tcp</type>
    <port>9</port>
    <txt-record>sys=adVF=0x100</txt-record>
    <txt-record>dk0=adVN=TimeMachine,adVF=0x82</txt-record>
</service>
</service-group>
```

```sh
systemctl restart avahi-daemon
```

## Samba

Install and configure Samba if you haven't already and then restart the Samba daemon. Here's the Time Machine section I used most recently if that's all you need.

```ini
[timemachine] 
    comment = Time Machine 
    path = /dpool/timemachine 
    browseable = yes 
    writable = yes 
    public = no 
    guest ok = no 
    fruit:time machine = yes 
    fruit:resource = stream 
    spotlight = no
    fruit:time machine max size = 2T
```

```sh
systemctl restart smbd nmbd
```

## ZFS

If your underlying storage is zfs, run these commands. Also make sure to set the appropriate permissions for the underlying folders reguardless of the filesystem.

```sh
zfs set casesensitivity=mixed dpool/timemachine
zfs set atime=off dpool/timemachine
zfs set recordsize=1M dpool/timemachine
zfs set acltype=posixacl dpool/timemachine
zfs set xattr=sa dpool/timemachine
```

```sh
chown -R dominic:dominic /dpool/timemachine
chmod -R 770 /dpool/timemachine
```

After this is all set, go to System Settings → General → Time Machine and click "Add Backup Disk". Evidently, it's not advised to "Connect to server" from the Finder. Also, if there’s existing junk in `/dpool/timemachine`, macOS may silently refuse it.