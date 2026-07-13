import { getCookie } from "../_utils/cookies";
import MessageForm from "@/_components/MessageForm";

const MessagePage = async () => {
  const cookie = await getCookie();
  const cookieId = cookie?.id as string;

  return (
    <main>
      <MessageForm cookieId={cookieId} />
    </main>
  );
};

export default MessagePage;
