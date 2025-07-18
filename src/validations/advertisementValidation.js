// Validate title
export function validateTitle(title) {
  if (!title || title.trim() === '') return 'Tiêu đề không được để trống';
  return '';
}

// Validate short description
export function validateShortDescription(desc) {
  if (!desc || desc.trim() === '') return 'Mô tả ngắn không được để trống';
  return '';
}

// Validate content
export function validateContent(content) {
  if (!content || content.trim() === '') return 'Nội dung quảng cáo không được để trống';
  return '';
}

// Validate priority (>0)
export function validatePriority(priority) {
  if (priority === undefined || priority === null || priority === '') return 'Độ ưu tiên không được để trống';
  if (isNaN(priority) || Number(priority) <= 0) return 'Độ ưu tiên phải lớn hơn 0';
  return '';
}

// Validate image type (PNG, JPG, JPEG, WEBP)
export function validateImageType(fileName) {
  if (!fileName) return 'Ảnh không được để trống';
  const allowed = ['png', 'jpg', 'jpeg', 'webp'];
  const ext = fileName.split('.').pop().toLowerCase();
  if (!allowed.includes(ext)) return 'Ảnh phải là PNG, JPG, JPEG hoặc WEBP';
  return '';
}

// Validate toàn bộ form quảng cáo
export function validateAdvertisement(form) {
  const errors = {};
  const titleError = validateTitle(form.title);
  if (titleError) errors.title = titleError;
  const shortDescError = validateShortDescription(form.shortDescription);
  if (shortDescError) errors.shortDescription = shortDescError;
  const contentError = validateContent(form.content);
  if (contentError) errors.content = contentError;
  const priorityError = validatePriority(form.priority);
  if (priorityError) errors.priority = priorityError;
  const imageTypeError = validateImageType(form.imageName || form.image);
  if (imageTypeError) errors.image = imageTypeError;
  return errors;
}
