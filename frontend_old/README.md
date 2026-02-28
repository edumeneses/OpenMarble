![Ladning](https://github.com/user-attachments/assets/28bc4489-d308-4cc6-ba20-b83d4ee6c473)

# Vision UI

> [!IMPORTANT]
> 🎉 <strong>VisionUI 26 is coming soon!</strong> Star this repo or keep an eye on it to follow along.

See the VisionUI 26 Announcement [here](#visionui-26-updates)

## What is Vision UI?

Vision UI is a collection of components that follow the VisionOS design language.

It uses most of the components from [shadcn/ui](https://ui.shadcn.com/) for the underlying components with others using [radix-ui](https://www.radix-ui.com/).

![Ornament](https://github.com/user-attachments/assets/8473d636-9eff-4de7-9224-6a306e3ed344)

![Environments](https://github.com/user-attachments/assets/fb692f7b-4935-4e93-9f86-0ea8665eaeef)

![Demo](https://github.com/user-attachments/assets/cd924064-d927-47ef-919e-9d169f67c7c9)

## VisionUI 26 Updates

### TL;DR

VisionUI 26 is a complete rewrite of Vision UI. By merging the Vision OS UI with Next.js layout, we have improved navigation, components, and performance, while also making it more accessible.

You can checkout the WIP demo [here](https://vision.uing.dev/vision-ui-26)

![Alert](https://github.com/user-attachments/assets/c1b349db-cef2-406d-a788-e36a08f9d128)

- [ ] More primitive & React-Native-styled components
  - [x] Alert API
  - [x] Sidebar
  - [x] Stack
  - [x] Ornament
  - [x] Button
  - [x] Dropdown Menu
  - [x] Grid List
- [x] Better navigation using Next JS layout as wrapper for `ornament`, `sidebar` components.
- [x] Improve performance
  - [x] Clean up unessessary divs
  - [x] Better component refactoring
- [ ] Sound effects


## Demo Video

[![Demo Video](https://img.youtube.com/vi/1tywYTXi0T4/0.jpg)](https://youtu.be/1tywYTXi0T4)

## How to use

This project assumes you already have `shadcn/ui` configured in your project.

Install `motion/react` in your project.

```bash
npm install motion/react
```

Then `copy/paste` the component you want to use into your project.

---

The Documentation is powered by [FumaDocs](https://fumadocs.vercel.app/)
