/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Thêm dòng này để Next.js tạo ra thư mục 'out' chứa index.html
  images: {
    unoptimized: true, // Bắt buộc phải có dòng này khi dùng Static Site
  },
};

export default nextConfig;
