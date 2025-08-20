# 🚀 ProgressAlert.js

A lightweight, customizable progress dialog & toast alert system built on top of [SweetAlert2](https://sweetalert2.github.io/)

Easily track tasks, show loading states, and give users real-time progress feedback with style.

# Features
- Step-based progress tracking
- Auto-simulated progress bar
- Custom messages & titles
- Toast or modal style alerts
- Configurable colors (success, fail, neutral, progress)
- Supports cancel button
- Events for onOpen & onFinish

# 📦 Installation
```html
<!-- Add SweetAlert2 (SweetAlert2 library) -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<!-- Add ProgressAlert.js (this library) -->
<script src="ProgressAlert.js"></script>
```
# 🚀 Usage
Basic Example
```js
const alert = new ProgressAlert({
  title: "Uploading File",
  message: "Please wait while we process your data...",
  steps: 5, // 5 steps = 20% each
  type: "modal", // "modal" or "toast"
  progressColor: "blue",
  progressColorSuccess: "lime",
  progressColorError: "red",
  onFinish: () => console.log("Upload finished!"),
});

alert.showProgressBar();

// Simulate progress
alert.demo();
```

Manual Progress Update
```js
// Increase by steps
alert.updateProgressWithSteps(ProgressAlert.SUCCESS);

// Or set exact percentage
alert.setProgress(50, "orange");

// Update the message dynamically
alert.updateMessage("Halfway done...");
```

Simulated Progress
```js
alert.simulateProgress(); // auto-increments until 100%
```
 _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
| Option                    | Type      | Default            | Description                          |
| ------------------------- | --------- | ------------------ | ------------------------------------ |
| `steps`                   | `number`  | `5`                | Number of steps to complete progress |
| `title`                   | `string`  | `"Processing"`     | Dialog/Toast title                   |
| `message`                 | `string`  | `"Please wait..."` | Message shown under title            |
| `progressColor`           | `string`  | `"blue"`           | Default progress bar color           |
| `progressColorSuccess`    | `string`  | `"lime"`           | Color when success step is used      |
| `progressColorError`      | `string`  | `"red"`            | Color when fail step is used         |
| `progressColorNeutral`    | `string`  | `"orange"`         | Neutral color                        |
| `progressBackgroundColor` | `string`  | `"darkblue"`       | Background track color               |
| `type`                    | `string`  | `"alert"`          | `"alert"` (modal) or `"toast"`       |
| `position`                | `string`  | `"center"`         | Position for toast mode              |
| `showCancelButton`        | `boolean` | `false`            | Show cancel button                   |
| `cancelButtonText`        | `string`  | `"Cancel!"`        | Text for cancel button               |
| `closeTimeout`            | `number`  | `1300`             | Delay before auto-close after 100%   |
 _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ 

# Demo
```js
 const demo = new ProgressAlert({
  title: "Demo",
  message: "Watch progress in action!",
  steps: 10,
  type: "toast",
});

demo.showProgressBar();
demo.demo();
```

# 📜 License
MIT License [©frosmoon](https://github.com/frosmoon) | [My Portfolio](https://byluis.studio)
