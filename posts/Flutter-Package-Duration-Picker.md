---
title: Flutter Package - Duration Picker
date: 2020/10/19
categories:
  - [flutter, packages]
---

## What does it do?

- User can easily pick a duration, by turning a rotary slider
- Returns a duration in form of a Dart "Duration" object
- Features a Material Design
- It still has some weird behaviours, which will hopefully be fixed in the future

## How to use it?

- First create a new Flutter project the prefered way you like to use.

- Just add it to your pubspec.yaml, either from pub.dev or from github if you want the newest changes as there are some important bugfixes on the Github version that are not on pub.dev

- [pub.dev](https://pub.dev/packages/flutter_duration_picker)

```yaml
dependencies:
  flutter_duration_picker:
    git:
      url: https://github.com/cdharris/flutter_duration_picker
```

or

```yaml
dependencies:
  flutter_duration_picker: ^1.0.4
```

Then run

```sh
flutter pub get
```

to download the dependency.
Now import it into your current file with this line of code (or let your IDE / Text Editor do it when needed):

```dart
import 'package:flutter_duration_picker/flutter_duration_picker.dart';
```

And then use it like this:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_duration_picker/flutter_duration_picker.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return  MaterialApp(
      title: 'Duration Picker Demo',
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _MyHomePageState createState() => new _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: DurationPicker(
            onChange: (duration) {
              // Gets called every time the picked duration changes | "duration" parameter is of type "Duration" and contains the current duration
            },
            snapToMins: 5.0, // Make the wheel snap to different minute - intervals
        ),
      ),
    );
  }
}

```

Basically like any other input widget but you can also use it like that:

```dart
() async {
  Duration resultingDuration = await showDurationPicker(
      context: context,
      initialTime: new Duration(minutes: 30),
  );

  // Display the picked duration
  Scaffold.of(context).showSnackBar(SnackBar(
    content: Text("Chose duration: $resultingDuration")));
}
```

The "showDurationPicker()" method returns a Future<Duration>, so you have to use the "await" keyword to use the method result later on.
When calling the method you really just have to pass the context as well as an initial time, which of course depends from usecase to usecase.

## What could you use it for?

I used it in an app where the user could create his own recipe library and of course for a recipe you need to know how long it takes to make it. So when the user enters a new recipe I use the duration picker to get the time it takes to make the recipe. This way I can also pretty easily and uniformly display a duration later on, compared to a simple text field, where every user may enter a duration in a different unit, so seconds or hours, or with ":" or without. And this list goes on and on. This small widget solves all of these problems and more.

Have a look at the source code of the app I mentioned [here](https://github.com/ecrax/recipe_library) if you want to see how I implemented this widget into an application [(here)](https://github.com/ecrax/recipe_library/blob/97c2edadbef63a21799a9023bce2856245058f46/lib/screens/add_recipe_screen.dart#L286).
