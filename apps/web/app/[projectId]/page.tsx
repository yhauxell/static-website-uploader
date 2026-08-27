import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStorageAdapter } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return {
    title: `Project ${projectId.slice(0, 8)}`,
    description: 'Uploaded project',
  };
}

async function getProjectIndex(projectId: string): Promise<string | null> {
  try {
    const content = await getStorageAdapter().getContent(`projects/${projectId}/index.html`);
    if (!content) return null;
    return content.toString('utf-8');
  } catch (error) {
    console.error('[v0] Error fetching index:', error);
    return null;
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  
  let isBlocked = false;
  try {
    const storage = getStorageAdapter();
    const metadataContent = await storage.getContent(`projects/${projectId}/metadata.json`);
    if (metadataContent) {
      const metadata = JSON.parse(metadataContent.toString('utf-8'));
      if (metadata.owner) {
        const userContent = await storage.getContent(`users/${metadata.owner}/profile.json`);
        if (userContent) {
          const userProfile = JSON.parse(userContent.toString('utf-8'));
          isBlocked = !!userProfile.isBlocked;
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch user block status', err);
  }

  const indexHtml = await getProjectIndex(projectId);

  if (!indexHtml) {
    notFound();
  }

  // This component will render the uploaded HTML with a base URL for relative asset serving
  return (
    <div className="relative">
      {isBlocked && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 font-medium shadow-md text-sm">
          Project is under review for removal.
        </div>
      )}
      <Link
        href="/"
        className="fixed right-3 top-3 z-20 rounded-full bg-black/75 px-3 py-1 text-xs font-medium text-white shadow-lg transition-opacity hover:opacity-90"
      >
        Built with Static Website Uploader · Create your own
      </Link>
      <iframe
        srcDoc={indexHtml.replace(
          /<head>/i,
          `<head><base href="/${projectId}/">`
        )}
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
        }}
        title="Uploaded Project"
        sandbox="allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
}
