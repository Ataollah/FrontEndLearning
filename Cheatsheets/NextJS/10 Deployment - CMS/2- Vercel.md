Deploying a Next.js app to Vercel is the most streamlined way to get it live. Vercel automatically detects Next.js and configures the optimal build settings for you.

Here are the two primary ways to do it.

### 🚀 Method 1: Git Integration (Recommended)

This is the standard way for ongoing development. It connects your repository to Vercel, so every push to your main branch triggers an automatic deployment.

1.  **Push Your Code**: Ensure your production-ready code is committed and pushed to a Git provider (GitHub, GitLab, or Bitbucket).
2.  **Import Project**: Go to your Vercel dashboard, click **Add New...** → **Project**, and select your repository from the list. Vercel will automatically detect that it's a Next.js project.
3.  **Configure Environment Variables**: In the project setup screen (or later in Settings), add any environment variables your app needs (like database URLs or API keys). **Important:** Vercel encrypts these and you can set different values for Production, Preview, and Development environments.
4.  **Deploy**: Click the **Deploy** button. Vercel will install dependencies, build your app, and assign you a live `.vercel.app` URL within minutes.

### 💻 Method 2: Vercel CLI

This is useful if you want to deploy directly from your terminal without pushing to Git first.

1.  **Install the CLI**: Run `npm i -g vercel` in your terminal.
2.  **Login & Deploy**: Navigate to your project folder and run the `vercel` command. Follow the prompts to link the project. For a production deployment, use `vercel --prod`.

### 🔍 Post-Deployment Tips

Once deployed, a few things to keep in mind:

*   **Environment Variables**: If you change an environment variable in the Vercel dashboard after a deployment, you must **redeploy** your application for the change to take effect.
*   **Build Errors**: If a build fails, check the **Build Logs** in your Vercel dashboard. It's often best to run `next build` locally first to catch errors early.
*   **Monorepos**: If your Next.js app lives in a subdirectory of a larger repository, you will need to set the **Root Directory** in your Vercel project settings to that specific folder.