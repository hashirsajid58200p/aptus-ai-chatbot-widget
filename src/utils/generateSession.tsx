import axios from "axios";

const generateSession = async ({
  email,
  username,
  phone,
  token,
  apiUrl,
}: {
  email: string;
  username: string;
  phone?: string;
  token: string;
  apiUrl: string;
}) => {
  try {
    const response = await axios.post(`${apiUrl}/session/create`, {
      email,
      username,
      phone: phone || "",
      token,
    });

    return response.data;
  } catch (error) {
    console.error("Error generating session:", error);
    throw new Error("Something went wrong while generating session");
  }
};

export default generateSession;
