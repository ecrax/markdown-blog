---
title: How to use FVM
date: 2020/10/26
categories:
  - [flutter, tools]
---

Hello everyone and welcome back to another video. Today we will be having a look at Flutter Version Management. If you want to follow along more slowly have a look at the writeup of this video on my blog, I will have it linked in the video description. And now, let's get right to it.

Also if you enjoy my content maybe consider subscribing and liking to help me making more videos just like this one.

Let's just quickly recap what FVM actually does. It allows you to install multiple versions of Flutter side by side. This can be very useful whenever you are working on multiple projects with different Flutter versions or when you are contributing to an open source project that uses a specific version of Flutter.
FVM is open source, link to the GitHub is in the description, and features both a GUI as well as a command line interface. In this video I will only cover the CLI as the GUI is still in alpha and has not worked for me very well anyways.

To use the version manager you will need to have either Dart as a standalone tool or Flutter installed, which has Dart bundled since the 1.19.0 dev release.
You can test if you have Dart installed by typing `dart` into a terminal and pressing enter. It should return anything but something along the lines "dart" is not a command.

To then install FVM run:

```
pub global activate fvm
```

On Windows you may need to add a path to your path environment variable but it should tell you if that is needed.

To see all the versions you can install run:

```
fvm releases
```

And to see all the versions you have installed already run:

```
fvm list
```

So let's install our first version.
We can either install a specific version, like 1.22.0 or we can install the head of a branch, like stable or dev.
To do that we want to run

```
fvm [version]
```

So to install the stable release of Flutter we would have to run:

```
fvm install stable
```

And let's also install the dev release:

```
fvm install dev
```

I want the stable version to be my default and global version. FVM allows us to do that with the "use" command and the "--global" flag. "use" just tells FVM that we now give it a version we want to use and the "--global" flag tells it that we want to use this version system-wide. So let's run

```
fvm use stable --global
```

We will also have to add this folder to our path. Of course this is different for every OS.
For the default location of FVM on Windows this is the folder: **"C:\Users\[USERNAME]\fvm\default\bin"**.
This is the folder where the global version is located.

But normally we would only change the version for every separate project.

To demonstrate that I will create a new project with "flutter create" and move into it with "cd".
(Also notice that when I run "flutter --version", it will return the version we set as a default version.)

This project now uses Flutter version 1.22.0 as this is the stable version at the time of this recording. But maybe you want to use Flutter Web and for that you need the Flutter dev branch.
With FVM we can simply type

```
fvm use dev
```

as to before where we had to change up our environment variables every time we want to switch our Flutter versions.
Now let's also have a look at the folders of our project. We can see that in it is a hidden folder called ".fvm". In there is a link to the current Flutter version for this project and a .json file with some information for the FVM CLI.
To access the Flutter version of this project (remember we set it to "dev"), in the terminal we have to append "fvm" in the front of every command.
So the normal

```
flutter run
```

now looks like this:

```
fvm flutter run
```

This is a bit annoying at first but either you live with it and you get used to it or you set up some aliases for some commands.

But this brings up another problem. How should our IDE or text editor know which Flutter version to use?
We just point it to the link in the ".fvm" folder I mentioned earlier.

I will show it based on VS Code because I think it is the primary editor for most of us.
First open up the settings.json file and make sure that there is no "dart.flutterSdkPaths" or "dart.flutterSdkPath" entry. If there are, make sure to delete them first before you continue.
Then add these lines:

```json
"dart.flutterSdkPaths": [
  ".fvm/flutter_sdk"
],
```

You may also need to add a comma to the line above if there isn't already.
This now always makes sure VS Code uses the Flutter version of this project to run your project etc..

And that's it for this video! Thank you so much for watching and if you have any questions feel free to ask in the comments below. And till then, see you next time. :)
