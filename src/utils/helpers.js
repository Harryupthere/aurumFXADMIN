
const images = import.meta.glob('/src/assets/images/*.{png,jpg,jpeg,svg}', { eager: true });

const imageMap = Object.keys(images).reduce((acc, path) => {
  const fileName = path.split('/').pop(); // Extract file name (e.g., "photo.png")
  acc[fileName] = images[path].default || images[path];
  return acc;
}, {});

// Export imageMap as a default export
export default imageMap;
