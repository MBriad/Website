/**
 * @file src/utils/editorImageUpload.js
 * @brief MDEditor 图片上传工具（命令、粘贴、拖拽）
 */

import { uploadAPI } from '../api/index.js';

/**
 * 上传图片并插入 Markdown 到光标位置
 * @param {File} file - 图片文件
 * @param {HTMLTextAreaElement} textarea - 编辑器 textarea 元素
 * @param {Function} onChange - 内容更新回调
 * @param {string} currentContent - 当前编辑器内容
 * @param {Function} onSuccess - 上传成功回调
 * @param {Function} onError - 上传失败回调
 */
export async function uploadAndInsertImage(file, textarea, onChange, currentContent, onSuccess, onError) {
  if (!file || !file.type.startsWith('image/')) return;

  const placeholder = '![上传中...]()\n';
  const cursorPos = textarea?.selectionStart ?? currentContent.length;
  const newContent = currentContent.slice(0, cursorPos) + placeholder + currentContent.slice(cursorPos);
  onChange(newContent);

  try {
    const res = await uploadAPI.uploadImage(file);
    const markdown = `![图片](${res.url})`;
    onChange(newContent.replace(placeholder, markdown));
    onSuccess?.('图片上传成功');
  } catch (err) {
    onChange(newContent.replace(placeholder, ''));
    onError?.(err.response?.data?.error || '图片上传失败');
  }
}

/**
 * 从剪贴板/拖拽事件中提取图片文件
 * @param {DataTransferItemList|FileList|File[]} items
 * @returns {File[]}
 */
export function extractImageFiles(items) {
  const files = [];
  for (const item of items) {
    const file = item instanceof File ? item : item.getAsFile?.();
    if (file && file.type.startsWith('image/')) {
      files.push(file);
    }
  }
  return files;
}

/**
 * MDEditor 自定义图片上传命令（工具栏按钮 + Ctrl+Shift+I）
 */
export const imageUploadCommand = {
  name: 'image-upload',
  keyCommand: 'imageUpload',
  buttonProps: { 'aria-label': '插入图片 (Ctrl+Shift+I)', title: '插入图片 (Ctrl+Shift+I)' },
  icon: (
    <svg width="12" height="12" viewBox="0 0 22 22" fill="currentColor">
      <path d="M20 5H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zM4 17V7h16l.002 10H4z" />
      <path d="M10.473 9.889 8.587 12.37 7 11l-4 5h16l-5.5-7-3.027 2.889z" />
      <circle cx="7.5" cy="9.5" r="1.5" />
    </svg>
  ),
  execute: (state, api) => {
    const textarea = api.textArea;
    if (!textarea) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = () => {
      const files = Array.from(input.files || []);
      processFilesSequentially(files, textarea);
    };
    input.click();
  },
};

/**
 * 顺序处理多个文件上传，直接操作 textarea 保持光标位置
 */
async function processFilesSequentially(files, textarea) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;

    const placeholder = '![上传中...]()\n';
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    textarea.value = before + placeholder + after;
    textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    try {
      const res = await uploadAPI.uploadImage(file);
      const markdown = `![图片](${res.url})`;
      textarea.value = textarea.value.replace(placeholder, markdown);
      const cursor = textarea.value.indexOf(markdown) + markdown.length;
      textarea.selectionStart = textarea.selectionEnd = cursor;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    } catch {
      textarea.value = textarea.value.replace(placeholder, '');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
