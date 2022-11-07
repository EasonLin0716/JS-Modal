# JS Modal

Easy usage and lightweight vanilla js modal

## Demo

https://easonlin0716.github.io/JS-Modal/demo/index.html

## Installation

You can install it by npm or simply by CDN

### npm

```
npm install @easonlin0716/js-modal
```

#### usage

```
import modal from "@easonlin0716/js-modal";
import "@easonlin0716/js-modal/dist/js-modal.min.css";
```

### cdn

```
// put css and js resources in your .html or any template
// css
<link rel="stylesheet" href="https://unpkg.com/@easonlin0716/js-modal/dist/js-modal.min.css" />
// js
<script src="https://unpkg.com/@easonlin0716/js-modal/dist/js-modal.js"></script>
```

## Usage

Open the modal:

```
modal.open(el, options)
```

Close the modal:

```
modal.close()
```

## Options

| Option           |  Type   |       Default | Description                                                                                  |
| ---------------- | :-----: | ------------: | -------------------------------------------------------------------------------------------- |
| containerClasses |  array  |      ["mask"] | Outer container css classes, accept multiple classes.                                        |
| closeClass       | string  | "close-modal" | Closing icon css class.                                                                      |
| modalClass       | string  |       "modal" | Modal content container class. This class will be append to the element passed in modal.open |
| fadeDuration     | number  |           260 | Fading duration.                                                                             |
| fadeDelay        | number  |           0.6 | Modal content fade delay.                                                                    |
| showClose        | boolean |          true | Allow display close button or not.                                                           |
| escapeClose      | boolean |          true | Allow close by escape button.                                                                |
| clickClose       | boolean |          true | Allow close by clicking background.                                                          |
| allowDrag        | boolean |         false | Allow modal to be dragged.                                                                   |
