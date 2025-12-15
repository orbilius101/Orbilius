/**
 * Generates a file path for student submissions storage
 * @param {string} userId - The authenticated user's ID
 * @param {string} projectId - The project ID
 * @param {number} stepNumber - The step number (1, 2, 3, etc.)
 * @param {string} fileExtension - The file extension (without the dot)
 * @returns {string} The complete file path for storage
 */
export function generateSubmissionFilePath(userId, projectId, stepNumber, fileExtension) {
  const timestamp = Date.now();
  return `${userId}/projects/${projectId}/step${stepNumber}/${timestamp}.${fileExtension}`;
}

/**
 * Extracts file extension from a filename
 * @param {string} filename - The filename to extract extension from
 * @returns {string} The file extension in lowercase
 */
export function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}
