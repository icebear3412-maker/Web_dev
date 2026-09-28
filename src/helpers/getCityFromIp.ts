import axios from "axios";

const getCityFromIp = async () => {
  try {
    const response = await axios.get("https://ipwho.is/");

    console.log(response.data);

    const { city } = response.data;

    return city;
  } catch (error) {
    console.error(error);
  }
};

export default getCityFromIp;
