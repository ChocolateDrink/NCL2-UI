# NCL2 UI

NCL2 UI is a lightweight JavaScript UI library made for developers who do not wish to spend time creating their own UI from scratch

# Documentation

### Module System
Creation of toggleable modules with:
- Key binding
- Persistent state
- Event callbacks

### Settings System
Provides two types of settings:
- Key binding
- Toggleable options

### Save System
Automatically saves and loads:
- Module states
- Key bindings
- UI position
- Settings configuration

## UI System

### Output Methods

```js
// Add message to output log
core.ui.output.add(text)

// Clear output log
core.ui.output.clear()

// Copy output log content
core.ui.output.copy()

// Debug logging methods (same as output)
core.ui.debug.add(text)
core.ui.debug.clear()
core.ui.debug.copy()
```

### Element Creation

```ts
core.ui.makeElement(type, className, text)
```
Creates a DOM element with specified type, class, and text content.

## Modules System

### Creating Modules

```js
const module = core.modules.add({
    id: 'Module Name',
    tip: 'Module description'
});
```

### Module Methods

```js
module.getState()    // Returns boolean indicating if module is enabled
module.getBind()     // Returns current key binding
module.setBind(key)  // Sets new key binding
module.toggle()      // Toggles module state
module.removeBind()  // Removes current key binding

// Event callbacks
module.onEnabled = () => {
    // Called when module is enabled
};

module.onDisabled = () => {
    // Called when module is disabled
};
```

## Settings System

### Creating Key Bindings

```js
const binding = core.settings.addBind({
    id: 'Setting Name',
    tip: 'Setting description',
    bind: 'F' // Optional
});

binding.onBind = (key) => {
    // Called when binding is triggered
};
```

### Creating Toggles

```js
const toggle = core.settings.addToggle({
    id: 'Toggle Name',
    tip: 'Toggle description'
});

toggle.onEnabled = () => {
    // Called when toggle is enabled
};

toggle.onDisabled = () => {
    // Called when toggle is disabled
};
```

### Toggle Methods

```js
toggle.getState()  // Returns boolean indicating if toggle is enabled
toggle.toggle()    // Toggles setting state
```

## Save System
Auto-save occurs every 5 seconds and on page unload.

### Methods

```js
core.saves.save()  // Manually save current settings
core.saves.load()  // Manually load saved settings
core.saves.init()  // Initialize auto-save
```

### Saved Data
- Module states and bindings
- Setting states and bindings
- UI window position


## Example Usage

```js
// Create a new module
const myModule = core.modules.add({
    id: 'Module',
    tip: 'Does something cool'
});

myModule.onEnabled = () => {
    core.ui.output.add('✔️ Module enabled');
};

myModule.onDisabled = () => {
    core.ui.output.add('❌ Module disabled');
};

// Create a keybind setting
const myBinding = core.settings.addBind({
    id: 'Special Action',
    tip: 'Trigger special action',
    bind: 'F'
});

myBinding.onBind = () => {
    core.ui.output.add('Special action triggered');
};

// Initialize save system
core.saves.init();
```