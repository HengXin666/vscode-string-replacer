# vscode-string-replacer

VsCode插件, 可配置的一键替换. (默认是替换部分中文标点为英文字符) [[Heng_Xin自用]]

## 描述

- 名称: 字符串替换器

- 功能: 在当前文件中执行批量字符串替换

    1. 可以配置替换列表.

    2. 可以选择去掉文件每一行末尾的空格.

> [!TIP]
> 使用: 又下角点击 `执行替换`, 或者默认快捷键 `CTRL + ALT + /`

## 构建

- 安装依赖

```sh
npm i
```

- 编译源码

```sh
npm run vscode:prepublish
```

- 调试运行: VsCode 中按 F5

- 构建包

```sh
sudo npm install -g vsce     
vsce package
```

## 安装

从 VsCode插件 中, 选择从 `.vsx` 导入即可.