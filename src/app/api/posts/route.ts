import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// MediaType-Enum, das mit dem Prisma-Schema übereinstimmt
enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

// Typen für die Antwort
interface PostResponse {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
  media: {
    id: string;
    url: string;
    type: MediaType;
  }[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
}

// GET /api/posts - Alle Beiträge abrufen
export async function GET(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // URL-Parameter abrufen
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const tab = searchParams.get('tab') || 'foryou';

    let posts;
    const userId = session.user.id;

    // Je nach Tab unterschiedliche Abfragen ausführen
    if (tab === 'following') {
      // Beiträge von Benutzern, denen der aktuelle Benutzer folgt
      posts = await prisma.post.findMany({
        where: {
          author: {
            followedBy: {
              some: {
                followerId: userId
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          },
          media: true,
          _count: {
            select: {
              likes: true,
              comments: true
            }
          },
          likes: {
            where: {
              userId
            },
            take: 1
          },
          saves: {
            where: {
              userId
            },
            take: 1
          }
        }
      });
    } else if (tab === 'saved') {
      // Gespeicherte Beiträge des aktuellen Benutzers
      posts = await prisma.post.findMany({
        where: {
          saves: {
            some: {
              userId
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          },
          media: true,
          _count: {
            select: {
              likes: true,
              comments: true
            }
          },
          likes: {
            where: {
              userId
            },
            take: 1
          },
          saves: {
            where: {
              userId
            },
            take: 1
          }
        }
      });
    } else {
      // "Für dich" Tab - Alle Beiträge, sortiert nach Erstellungsdatum
      // In einer realen Anwendung würde hier ein komplexerer Algorithmus verwendet werden
      posts = await prisma.post.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          },
          media: true,
          _count: {
            select: {
              likes: true,
              comments: true
            }
          },
          likes: {
            where: {
              userId
            },
            take: 1
          },
          saves: {
            where: {
              userId
            },
            take: 1
          }
        }
      });
    }

    // Formatiere die Beiträge für die Antwort
    const formattedPosts = posts.map((post: any): PostResponse => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      author: post.author,
      media: post.media.map((media: any) => ({
        id: media.id,
        url: media.url,
        type: media.type
      })),
      likes: post._count.likes,
      comments: post._count.comments,
      isLiked: post.likes.length > 0,
      isSaved: post.saves.length > 0
    }));

    // Gesamtanzahl der Beiträge für Pagination
    const totalPosts = await prisma.post.count({
      where: tab === 'following' 
        ? {
            author: {
              followedBy: {
                some: {
                  followerId: userId
                }
              }
            }
          }
        : tab === 'saved'
          ? {
              saves: {
                some: {
                  userId
                }
              }
            }
          : {}
    });

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Beiträge:', error);
    return NextResponse.json({ error: 'Fehler beim Abrufen der Beiträge' }, { status: 500 });
  }
}

// POST /api/posts - Neuen Beitrag erstellen
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/posts - Anfrage erhalten');
    
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user) {
      console.log('Nicht authentifiziert');
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    
    console.log('Benutzer authentifiziert:', session.user.id);

    // Anfragedaten abrufen
    const data = await request.json();
    console.log('Anfragedaten:', data);
    
    const { content, mediaIds = [] } = data;

    if (!content && mediaIds.length === 0) {
      console.log('Beitrag muss Text oder Medien enthalten');
      return NextResponse.json({ error: 'Beitrag muss Text oder Medien enthalten' }, { status: 400 });
    }

    // Hashtags aus dem Inhalt extrahieren
    const hashtags = content.match(/#(\w+)/g) || [];
    const tagNames = hashtags.map((tag: string) => tag.substring(1).toLowerCase());
    console.log('Extrahierte Tags:', tagNames);

    try {
      console.log('Versuche, Beitrag zu erstellen...');
      console.log('Benutzer-ID:', session.user.id);
      console.log('Content:', content);
      console.log('Media IDs:', mediaIds);
      
      // Beitrag erstellen
      const post = await prisma.post.create({
        data: {
          content,
          authorId: session.user.id,
          media: mediaIds.length > 0 ? {
            connect: mediaIds.map((id: string) => ({ id }))
          } : undefined
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          },
          media: true
        }
      });
      
      console.log('Beitrag erstellt:', post.id);

      // Tags erstellen oder verknüpfen
      if (tagNames.length > 0) {
        console.log('Verarbeite Tags...');
        // Für jeden Tag:
        // 1. Finde oder erstelle den Tag
        // 2. Verknüpfe ihn mit dem Beitrag
        for (const name of tagNames) {
          console.log('Verarbeite Tag:', name);
          const tag = await prisma.tag.upsert({
            where: { name },
            update: {},
            create: { name }
          });

          await prisma.postTag.create({
            data: {
              postId: post.id,
              tagId: tag.id
            }
          });
        }
      }

      console.log('Beitrag erfolgreich erstellt');
      return NextResponse.json({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        author: post.author,
        media: post.media.map((media: any) => ({
          id: media.id,
          url: media.url,
          type: media.type
        })),
        likes: 0,
        comments: 0,
        isLiked: false,
        isSaved: false
      });
    } catch (dbError) {
      console.error('Datenbankfehler beim Erstellen des Beitrags:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unbekannter Datenbankfehler';
      const errorStack = dbError instanceof Error ? dbError.stack : '';
      console.error('Datenbankfehlerdetails:', { message: errorMessage, stack: errorStack });
      
      return NextResponse.json({ 
        error: 'Datenbankfehler beim Erstellen des Beitrags', 
        details: errorMessage 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Allgemeiner Fehler beim Erstellen des Beitrags:', error);
    // Detailliertere Fehlerinformationen
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Fehlerdetails:', { message: errorMessage, stack: errorStack });
    
    return NextResponse.json({ 
      error: 'Fehler beim Erstellen des Beitrags', 
      details: errorMessage 
    }, { status: 500 });
  }
}
