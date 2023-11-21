import currentProfile from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    //get profile
    const profile = await currentProfile();

    //no profile
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //no params with memeber id
    if (!params.serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: {
          not: profile.id, // admin cannot leave their own server
        },
        members: {
          some: {
            profileId: profile.id, // only members of the server can leave the server
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("SERVER_ID_LEAVE", error);
    return new NextResponse("Internal Erro", { status: 500 });
  }
}
