# NiceUI Build JS

Helpers for [NiceUI](https://github.com/niceui-lib/) framework.

## Install

```bash
npm i -D niceui-build
```

## Usage

### Use Case 1: PostCSS stylesheet in Rust WASM Component. Stylesheet supports CSS Modules

In your Rust project create `package.json`, `postcss.config.js`, `css/styles.module.css` and `build.rs` and modify `lib.rs`.

#### package.json

```json
{
  "scripts": {
    "build": "postcss css --dir $OUT_DIR"
  },
  "devDependencies": {
    "niceui-build": "^1.0.0",
    "autoprefixer": "^9.8.0",
    "cssnano": "^4.1.10",
    "lost": "^8.3.1",
    "postcss-cli": "^7.1.1",
    "postcss-modules": "^2.0.0",
    "postcss-preset-env": "^6.7.0"
  }
}
```

#### postcss.config.js

```javascript
module.exports = (ctx) => ({
  plugins: [
    require("autoprefixer")({ grid: false }),
    require("postcss-preset-env")({ stage: 1 }),
    require("lost")({}),
    require("postcss-modules")({
      getJSON: require('niceui-build').postCssPluginJsonToRustStruct,
    }),
    require("cssnano")({}),
  ],
});
```

#### css/styles.module.css

```css
.example {
    border: 1px solid green;
}
```

#### build.rs

```rust
use std::process::Command;

fn main() {
    Command::new("npm").args(&["run", "build"]).status().unwrap();
    println!("cargo:rerun-if-changed=css/styles.module.css");
    println!("cargo:rerun-if-changed=package-lock.json");
    println!("cargo:rerun-if-changed=package.json");
    println!("cargo:rerun-if-changed=postcss.config.js");
    println!("cargo:rerun-if-changed=build.rs");
}
```

#### lib.rs

```rust
include!(concat!(env!("OUT_DIR"), "/styles.module.rs"));

pub(crate) const STYLES_MODULE_CSS: &str =
    include_str!(concat!(env!("OUT_DIR"), "/styles.module.css"));

pub(crate) fn test() {
    eprintln!("{:?}", STYLES_MODULE_DEFAULT);
    eprintln!("{}", STYLES_MODULE_DEFAULT.example);
    eprintln!("{}", STYLES_MODULE_CSS);
}
```

Now you have type safe and modular css in Rust, congratulations!