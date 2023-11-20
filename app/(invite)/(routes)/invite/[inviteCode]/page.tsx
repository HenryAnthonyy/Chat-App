import currentProfile from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface InviteCodePageProps {
  params: {
    inviteCode: string;
  };
}

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  //checking if we have an invite code
  if (!params.inviteCode) {
    return redirect("/");
  }

  //check if person trying to join is already a memeber
  const exisitingServer = await db.server.findFirst({
    where: {
      inviteCode: params.inviteCode,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  //if the person is already a memeber, they are redirected back the server
  if (exisitingServer) {
    return redirect(`/servers/${exisitingServer.id}`);
  }

  //otherwise we update the server invite code using the unique invite code
  //modify the data, members and then create a new member using the profile id
  const server = await db.server.update({
    where: {
      inviteCode: params.inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id,
          },
        ],
      },
    },
  });

  // if a server exists
  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return null;
};

export default InviteCodePage;
