import axios from "axios";

const getChatbotDetails = async (token: string, apiUrl: string) => {
  try {
    const response = await axios.get(`${apiUrl}/user/token/verify`, {
      headers: {
        "x-chatbot-token": token,
      },
      params: {
        _cb: new Date().getTime(),
      },
    });

    return response.data.data;

  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Something went wrong while fetching chatbot details";
    const customErr: any = new Error(errorMsg);
    customErr.response = error?.response;
    throw customErr;
  }
};

export default getChatbotDetails;
