/**
 * See backend counterpart here:
 * https://github.com/Vizzuality/landgriffon/blob/staging/api/config/default.json#L36
 *
 * NOTE: The API defaults to Kilobytes.
 * 'react-dropzone' which we are using in the uploaders expects Bytes.
 */

export const FILE_UPLOADER_MAX_SIZE = 1500000; // 1.5MB (backend says 1.51, let's keep it a round number)
