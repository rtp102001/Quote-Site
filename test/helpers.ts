export const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
export const JPG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
export const photo = (name = "a.png", type = "image/png", bytes = PNG) => ({ name, type, bytes });
