declare module 'pdfmake/build/standard-fonts/Courier' {
  const courier: Parameters<typeof import('pdfmake/build/pdfmake').addFontContainer>[0];
  export default courier;
}
