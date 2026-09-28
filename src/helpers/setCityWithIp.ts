import axios from 'axios';

const setCityWithIp = async () => {
  const city = localStorage.getItem('city');
  if (city !== undefined) return;
  try {
    const response = await axios.get('https://ipwho.is/');

    console.log(response.data);

    const { city } = response.data;

    localStorage.setItem('city', city);
  } catch (error) {
    console.error(error);
  }
};

export default setCityWithIp;
