import axios from "axios";

export const getCoinsName = async() => {
    try {
        const response = await axios.get(
          `/coins.json`
        );
        const data = response?.data;
        return data;
      } catch (error) {
        console.log("ERROR", error);
      }
}