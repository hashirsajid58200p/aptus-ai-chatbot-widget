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

  } catch (error: unknown) {
    const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
    const errorMsg = axiosErr?.response?.data?.message || axiosErr?.message || "Something went wrong while fetching chatbot details";
    const customErr = new Error(errorMsg) as Error & { response?: unknown };
    customErr.response = axiosErr?.response;
    throw customErr;
  }
};

export default getChatbotDetails;
