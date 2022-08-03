export const COMMON_CONTENT_CLASSES =
  'w-11/12 absolute top-1/2 inset-x-4 left-1/2 transform -translate-y-1/2 sm:-translate-x-1/2 outline-none bg-white flex flex-col flex-grow overflow-hidden rounded rounded-md p-6';

export const CONTENT_CLASSES = {
  narrow: `sm:w-4/6 md:w-1/2 lg:w-5/12 xl:w-1/3 ${COMMON_CONTENT_CLASSES}`,
  default: `sm:w-4/5 md:w-2/3 lg:1/2 xl:w-2/5 ${COMMON_CONTENT_CLASSES}`,
  wide: `sm:w-screen md:w-screen lg:w-screen xl:w-screen ${COMMON_CONTENT_CLASSES}`,
};

export const OVERLAY_CLASSES = 'z-50 fixed inset-0';
