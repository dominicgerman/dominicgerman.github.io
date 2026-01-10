---
title: Playing Old Video Games on a Raspberry Pi
# description: Who doesn't love video games amirite?
pubDate: 2024-08-19
tags:
  - programming
  - raspberry-pi
draft: false
---
I grew up playing PlayStation 1 games in the early 2000s. While all my friends were playing their PlayStation 2 games, I had just started playing Crash Bandicoot, Descent, and [Bubsy 3D](https://www.youtube.com/watch?v=NHjJPAkPzYU). I'm not much of a gamer anymore — the last game console I bought was a used Nintendo GameCube in 2006. 

So why did I just yesterday repurpose a Raspberry Pi 4 for playing old PS1 games? Normally, I wouldn't be able to justify spending time on such a frivolous project. But the other day, while changing my five-week-old daughter's diaper, she shot me a dirty look as if to say "In a few years, I'll be kicking your ass in Lego Racers." Obviously, I cannot allow this to happen. But I'm rusty and I no longer have my old PlayStation console. I needed a way to practice.

## Supplies

- [Raspberry Pi 4](https://a.co/d/2GvgHeK) (preferably with 8GB of memory)
- [3A power supply](https://a.co/d/6s5XphR)
- [Micro SD card](https://a.co/d/0NFu9J5)
- [MicroHDMI to HDMI cable](https://a.co/d/de78H7D) 
- [USB drive (optional)](https://a.co/d/cjWgJs7)
- Second computer (for flashing the OS)
- [USB Gamepad](https://a.co/d/6TsgpH8)
- Keyboard (optional but recommended)
- Monitor or TV
- ROMs (game files)


If you're following along at home, I linked to the items that I used in my setup. As for the ROMS, I'm not going to point you in any particular direction here because of copyright laws. But if you're like I was yesterday and don't know anything about ROMs, Google and (especially) Reddit are your your friends. Also, I relied heavily on the [RetroPie docs](https://retropie.org.uk/docs/) and I highly suggest you consult them if you run into any issues.

## Flashing the OS

Grab your MicroSD card and insert it into your main computer (not your pi). Download the [Raspberry Pi Imager](https://www.raspberrypi.com/software/) if you don't have it already. Click "Choose Device" and select the Pi model you'll be using. Then click "Choose OS" –> "Emulation and game OS" –> "RetroPie" –> and choose the version that corresponds to your pi, probably RPI 4/400. Then click "Choose Storage" and select the MicroSD card you just inserted. Make sure you select the right drive because this process will completely erase whichever drive you select. Click "Next" and wait for the flashing process to complete.

## Booting the Pi

Take the MicroSD card you just flashed and insert it into the MicroSD slot on your Raspberry Pi. Connect your pi to a monitor or TV via the MicroHDMI cable, and then connect your pi to its power source. After it boots, you should see a screen that says "Welcome. No Game Pads Detected."

Before setting up your gamepad, it's worth setting up a keyboard in case your controller's config gets messed up and you need something to fall back on. Go through the config process for the keyboard. I set D-pad directions to the arrow keys, A, B, X, and Y to their respective letters on the keyboard, Start to Enter, Select to Shift and Hotkey Enable to Space. You can skip the other ones by holding any key.


> NB: It's important to set up your hotkey. Don't skip that one.


After the keyboard is set up, plugin your gamepad. Press Enter on your keyboard (Start button) and go down to "Configure Input". Press A to select it and press A again to confirm if needed. It should ask you to hold any button on your gamepad to begin the configuration process. Once it recognizes your gamepad, you can go through and set it up as normal. One thing to note is that on PlayStation, "X" corresponds to "Button B / South" which is frequently used for "Back" in the RetroPie UI. This can be confusing since "X" is usually the button you press to select something on PlayStation.

## Configuring Raspberry Pi settings

Up to this point, we haven't set up some of the usual Raspberry Pi settings like hostname, password, wi-fi, and SSH. There are a couple of ways to to do this but I'm going to walk you through how to do it in RetroPie.

> NB: You can probably skip these and come back to them later if you want. I don't think you technically need them for the rest of the setup.

The main RetroPie screen should only have one option, "Configuration". If that's where you're at click that. If you see options like "Audio", and "Bluetooth", congrats, you're already at the next screen. Select the Raspi-Config option and press A. You should see a blue screen with a grey box with nine or so config options. Inside system options, you can set your hostname (I left mine as the default), password, and wi-fi network. Then go back to the blue screen and select "Interface options" to configure SSH. If you don't know your way around SSH, you don't have to set this up. It can helpful for loading ROMs onto your pi but I'm going to show you how to do it without SSH.

## Adding ROMs

Now comes the part where we add the games. If you don't already have a bunch of game files ready to load, you should probably get some. Again, Reddit and Google are your friends. My ROMs were `.zip` files that each contained a folder named for the title of the game and in each folder was a `.bin` and a `.cue` file. 

First, create a folder called `retropie` on your USB drive (from your main computer) and then plug it into your pi. After a minute or two, remove the USB drive from your pi and plug it back into the computer containing the ROMs. Add the ROMs (folders) to the USB drive within the `retropie/roms/psx` folder that should now exist on the drive and then plug it back into the pi. Your games should transfer on their own but there's no way to track the progress. I had about a dozen games and it took about 5 minutes or less to transfer them. After five minutes, I checked to see if the files had transfered via the File Manager which is slightly weird shell environment. After all the games are loaded, you can remove the USB drive, and press **Start** –> **Quit** –> **Restart EmulationStation**. After the system restarts, you should be able to see "PlayStation" in addition to the "Configuration" option on the main menu screen. 

## Controller weirdness

One last thing you'll want to know before you start playing your games. By default, your analog sticks probably won't work when you first try to play a game. This is because the original PlayStation controllers didn't have analog sticks and so some games don't support them. The reason they're turned off by default is because if you tried to load a game that didn't support the analog sticks, no buttons on your controller would work at all. So after you open up your first game, you'll want to open the "Quick Menu" by pressing Hotkey (the "Select" button by default) and "X" (square, I think), select "Controls", and then change the Device Type from **standard** to **dualshock** for both **Port 1 controls** and **Port 2 controls**. Then go back to the **Controls** page and select **Save Core Remap File** to save this setting as a default for all games. If you later open a game and none of the buttons work, follow the same steps as before but this time switch from **dualshock** to **standard** and instead of saving the **Core Remap File**, you'll want to **Save Game Remap File**. 

## Conclusion

And that's it! Now you can play old video games on the cheap instead of spending an arm and a leg on those newfangled XBOXs and whosywhatsits. Have fun!