/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-05-08 13:47:40
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-05-19 18:16:08
 * @FilePath: /marketsubscription/next.config.mjs
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/infoSub/:path*',
        destination: 'http://54.238.193.37:8081/infoSub/:path*', 
      },
    ];
  },
};

export default nextConfig;
