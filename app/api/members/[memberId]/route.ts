import currentProfile from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    //initialize profile
    const profile = await currentProfile();

    const { searchParams } = new URL(req.url);
    const { role } = await req.json();

    //destructure server id
    const serverId = searchParams.get("serverId");

    //no profile
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //no server
    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    //no params with memeber id
    if (!params.memberId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    //update server
    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: params.memberId,
              profileId: {
                not: profile.id, //to prevent user from changing their own role
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

//DELETE FUNCTION
export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();

    const { searchParams } = new URL(req.url);

    //destructure server id
    const serverId = searchParams.get("serverId");

    //no profile
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //no server
    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    //no params with memeber id
    if (!params.memberId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          deleteMany: {
            id: params.memberId,
            profileId: {
              not: profile.id, // prevent admin from deleting themselves from the server.
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("MEMBER_ID_DELETE", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
