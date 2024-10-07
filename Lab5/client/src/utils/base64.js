const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Убираем 'data:*/*;base64,'
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

 export default toBase64;