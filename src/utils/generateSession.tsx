import axios from "axios";

const generateSession = async ({
  email,
  username,
  phone,
  token,
  apiUrl,
  visitorId,
}: {
  email: string;
  username: string;
  phone?: string;
  token: string;
  apiUrl: string;
  visitorId?: string;
}) => {
  try {
    const response = await axios.post(`${apiUrl}/session/create`, {
      email,
      username,
      phone: phone || "",
      token,
      visitorId: visitorId || undefined,
    });

    return response.data;
  } catch (error) {
    console.error("Error generating session:", error);
    throw new Error("Something went wrong while generating session");
  }
};

export default generateSession;
