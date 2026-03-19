import Head from 'next/head';
import Link from 'next/link';

export default function FreelancerGuide() {
  return (
    <div className="dark min-h-screen selection:bg-brand-primary/30 text-slate-200 bg-[#0b0f1a] font-sans">
      <Head>
        <title>Freelancer Guide: Automate Client Research with AI | Scrayva</title>
        <meta name="description" content="Finding new clients takes too much time for freelancers. AI tools can do this work for you quickly and smartly, so you focus on your skills." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <style jsx global>{`
        .article-content h2 { font-family: var(--font-manrope, 'Manrope'), sans-serif; font-size: 1.875rem; font-weight: 800; color: #ffffff; margin-top: 3rem; margin-bottom: 1.5rem; }
        .article-content h3 { font-family: var(--font-manrope, 'Manrope'), sans-serif; font-size: 1.5rem; font-weight: 700; color: #f8fafc; margin-top: 2rem; margin-bottom: 1rem; }
        .article-content h4 { font-family: var(--font-manrope, 'Manrope'), sans-serif; font-size: 1.125rem; font-weight: 700; color: #e2e8f0; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .article-content p { font-size: 1.125rem; line-height: 1.8; color: #94a3b8; margin-bottom: 1.5rem; }
        .article-content strong { color: #f1f5f9; font-weight: 600; }
        .article-content ul { list-style-type: none; padding-left: 0; margin-bottom: 1.5rem; color: #94a3b8; font-size: 1.125rem; line-height: 1.8; }
        .article-content li { margin-bottom: 0.75rem; position: relative; padding-left: 1.5rem; }
        .article-content li::before { content: "•"; position: absolute; left: 0; color: #8b5cf6; font-weight: bold; }
        .article-content .highlight-box { background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 1rem; padding: 1.5rem; margin: 2rem 0; }
        
        .pie-chart {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: conic-gradient(
            #8b5cf6 0% 60%, 
            #3b82f6 60% 90%, 
            #ef4444 90% 100%
          );
        }
      `}</style>

      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/5 bg-[#0b0f1a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white font-headline">Scrayva</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors font-medium">Home</Link>
            <Link href="/about" className="text-slate-400 hover:text-white transition-colors font-medium">About</Link>
            <Link href="/blog" className="text-brand-accent transition-colors font-semibold">Blog</Link>
            <Link href="/pricing" className="text-slate-400 hover:text-white transition-colors font-medium">Pricing</Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors font-medium hidden sm:block">Login</Link>
            <Link href="/signup" className="bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2 rounded-full transition-all text-sm font-semibold shadow-lg shadow-brand-primary/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        {/* Article Header */}
        <header className="max-w-3xl mx-auto px-6 mb-16 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-brand-accent hover:text-brand-primary transition-colors text-sm font-semibold mb-8 group">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Blog
          </Link>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="px-3 py-1 bg-brand-primary/10 text-brand-accent text-xs font-bold uppercase tracking-wider rounded-full">Freelance</span>
            <span className="text-slate-500 text-sm font-medium">12 min read</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-headline font-extrabold text-white leading-[1.1] mb-6">
            Freelancer Guide: Automate <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Client Research</span> with AI
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed mb-10">
            Finding new clients takes too much time for freelancers. AI tools can do this work for you quickly and smartly, so you focus on your skills.
          </p>

          <div className="flex items-center justify-center gap-4 pt-8 border-t border-white/10">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtK-bFclI9QG67pMhM9M2JkQ8fLIfXq_4W6H-T9gO91F9a6r3i94Tq_4T8V_a8P05510-O-H_54S51s6rO51qW-6v6B_bB987xXo07F__o_48T04O5s2z9H_g49E4y5f_p366B5jNfNfH4Uq5_eD3wW-L_gA5JcE9_pU3kZ2bJ-g" alt="Jordan Smith" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm">Jordan Smith</p>
              <p className="text-slate-500 text-xs">March 19, 2026</p>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article className="max-w-3xl mx-auto px-6 article-content">
          
          <p>
            This guide gives simple steps, tools, and Indian stories to automate client research. Start saving hours today and grow your freelance income.
          </p>

          <h2>Why Client Research Matters</h2>
          <p>
            Freelancers in India face big competition. Platforms like Upwork and Fiverr have millions of users. Manual research means checking LinkedIn, websites, and emails every day.
          </p>
          <p>
            AI changes everything. It finds leads, checks if they match your services, and even drafts messages. Freelancers save up to 80% time, working more on paid projects. In India, 15 million freelancers earn from global clients. AI helps students and side hustlers like you beat the rush.
          </p>

          <figure className="my-12">
            <img src="/images/blog/blog2_bar_chart.png" alt="Time saved with AI client research for freelancers" className="w-full rounded-2xl shadow-2xl shadow-brand-primary/10 border border-white/10" />
            <figcaption className="text-center text-slate-500 text-sm mt-4">Bar chart showing manual research (10 hours/week) vs AI (2 hours/week).</figcaption>
          </figure>

          <h2>Big Wins for Indian Freelancers</h2>
          <p>
            India's freelance market grows fast. Many from small towns use AI to reach US and Europe clients paying in dollars.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <span className="material-symbols-outlined text-brand-primary mb-3 text-3xl">schedule</span>
                <h4 className="mt-0 text-white">Save time</h4>
                <p className="text-sm m-0">Find 50 highly targeted leads in mere minutes.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <span className="material-symbols-outlined text-brand-primary mb-3 text-3xl">target</span>
                <h4 className="mt-0 text-white">Better matches</h4>
                <p className="text-sm m-0">Target companies needing your exact specialized skills.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <span className="material-symbols-outlined text-brand-primary mb-3 text-3xl">payments</span>
                <h4 className="mt-0 text-white">More money</h4>
                <p className="text-sm m-0">Handle 3x the clients without suffering from burnout.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <span className="material-symbols-outlined text-brand-primary mb-3 text-3xl">bolt</span>
                <h4 className="mt-0 text-white">Easy start</h4>
                <p className="text-sm m-0">Utilize free tools immediately with absolutely no coding needed.</p>
            </div>
          </div>
          
          <p>
            Ramesh, a teacher from a Kerala village, started with ChatGPT. He found design clients and now earns ₹60,000 monthly besides his job.
          </p>

          <h2>Best Free and Cheap AI Tools</h2>
          <p>No need for expensive software. These work perfectly for beginners entirely within budget.</p>
          <ul>
            <li><strong>ChatGPT:</strong> Free AI chat. Use prompts like "Find web design clients in Mumbai."</li>
            <li><strong>Perplexity AI:</strong> Smart, internet-connected search for live leads and company info.</li>
            <li><strong>Apollo.io:</strong> Finds verified B2B emails (free for 50/month).</li>
            <li><strong>Zapier:</strong> Links tools, no code required (generous free tier).</li>
            <li><strong>Hunter.io:</strong> Email finder extension.</li>
            <li><strong>Google Sheets + AI add-ons:</strong> Track everything free.</li>
          </ul>
          
          <div className="highlight-box">
            <p className="m-0 font-semibold text-white">💰 Total cost: Under ₹500/month. Priya, a Delhi Class 10 student, uses these for coding gigs.</p>
          </div>

          <h2>Step-by-Step Setup Guide</h2>
          <p>Follow these 8 simple steps. You can set the entire process up in one weekend.</p>

          <figure className="my-12">
            <img src="/images/blog/blog2_flowchart.png" alt="AI automate client research flowchart for freelancers" className="w-full rounded-2xl shadow-2xl shadow-brand-primary/10 border border-white/10" />
            <figcaption className="text-center text-slate-500 text-sm mt-4">Flowchart visually mapping the 8-step automation path.</figcaption>
          </figure>

          <h3>Step 1: Know Your Perfect Client</h3>
          <p>Define exactly who you want to pitch to:</p>
          <ul>
            <li><strong>Industry:</strong> Tech, e-commerce, healthcare.</li>
            <li><strong>Size:</strong> 10-100 employees.</li>
            <li><strong>Needs:</strong> Content writing, web dev, SEO.</li>
            <li><strong>Budget:</strong> ₹10,000+ per project.</li>
          </ul>
          <p><em>Prompt ChatGPT: "List 10 ideal clients for freelance graphic designer in India."</em></p>

          <h3>Step 2: Generate Leads Fast</h3>
          <p>Use Perplexity: "Tech startups in Bangalore hiring freelancers in 2026." Copy 20 leads directly to Google Sheets with their Name, Company, and Website.</p>

          <h3>Step 3: Find Contact Info</h3>
          <p>Paste those websites into Apollo or Hunter. Get emails and LinkedIn profiles in seconds.</p>
          <p><em>Zapier auto step: New Sheet row → Find email → Automagically Add to column.</em></p>

          <h3>Step 4: Score Leads Smartly</h3>
          <p>Not all leads are going to win. AI rates them to save you rejection and time.</p>
          <p>In Sheets, prompt ChatGPT: "Score 1-10: Company X needs logos, budget ₹20k." Focus purely on 8+ scores.</p>
          
          {/* Custom CSS Pie Chart */}
          <figure className="my-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-center gap-10">
            <div className="pie-chart shadow-[0_0_30px_rgba(139,92,246,0.3)] border-4 border-[#0b0f1a]"></div>
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-brand-primary"></div>
                    <span className="text-white font-bold">60% High Score (8-10)</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-slate-300 font-medium">30% Medium (5-7)</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-slate-400">10% Low (1-4)</span>
                </div>
            </div>
          </figure>

          <h3>Step 5: Craft Personal Emails</h3>
          <p>Generic copy-paste fails. AI personalizes at scale.</p>
          <p><em>Prompt: "Write a short email to Priya at TechStartup. Mention their new app launch. Offer freelance help."</em> Tools like Instantly.ai can send 100s of these automatically formatted emails.</p>

          <h3>Step 6: Auto Follow-Ups</h3>
          <p>80% of deals require 3 or more touches. With Zapier: If no reply naturally in 3 days → Send polite follow-up.</p>

          <h3>Step 7: Track in One Place</h3>
          <p>Use Notion or Google Sheets. Track the <em>Date sent</em>, <em>Replies</em>, and <em>Meetings booked</em>. Review this pipeline weekly.</p>

          <h3>Step 8: Test and Improve</h3>
          <p>Track: 100 leads → 20 replies → 5 clients. Tweak your ChatGPT prompts for better results.</p>
          <p>Ramesh did this exactly. He went from 0 to 4 high-paying clients in just 2 months.</p>

          <h2>Real Indian Success Stories</h2>
          <p>Stories completely prove this framework works in the real world.</p>
          
          {/* Unsplash Image Collage Placeholder Array */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
            <div className="aspect-square rounded-2xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80" alt="Indian freelancer female" className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80" alt="Indian freelancer male" className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80" alt="Indian freelancer student" className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105" />
            </div>
            <figcaption className="sm:col-span-3 text-center text-slate-500 text-sm mt-2">Indian freelancers using AI successfully from their homes.</figcaption>
          </div>

          <ul>
            <li><strong>Ramesh from Kerala:</strong> Village teacher, poor English at the start. AI translated pitches, found US logo clients. Challenge: Slow internet. Fix: Mobile data. Now earning ₹60k/month as a side income.</li>
            <li><strong>Priya from Delhi:</strong> Class 10 student (your age maybe). Automated coding leads on LinkedIn. Got 3 mentors as clients, earned ₹20,000 for books and fees. Her tip: "One step daily."</li>
            <li><strong>Amit from Mumbai:</strong> Ex-IT guy. Used Apollo + Zapier for marketing gigs. Scaled effortlessly to ₹2 lakh/month, hired helpers to automate more.</li>
          </ul>

          <h2>Fix Common Problems</h2>
          <div className="overflow-x-auto my-8">
            <table className="w-full text-left text-sm whitespace-nowrap bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-[#0f172a] text-slate-300">
                    <tr>
                        <th className="px-6 py-4 font-bold border-b border-slate-800">Problem</th>
                        <th className="px-6 py-4 font-bold border-b border-slate-800">Quick Fix</th>
                        <th className="px-6 py-4 font-bold border-b border-slate-800">Software Tool</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    <tr className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-white">No emails found</td>
                        <td className="px-6 py-4 text-brand-accent">Try 2 finders</td>
                        <td className="px-6 py-4 text-slate-400">Apollo + Hunter</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-white">1% reply rate</td>
                        <td className="px-6 py-4 text-brand-accent">Personalize drastically more</td>
                        <td className="px-6 py-4 text-slate-400">Advanced ChatGPT prompts</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-white">Too many messy leads</td>
                        <td className="px-6 py-4 text-brand-accent">Strictly limit to 20/day</td>
                        <td className="px-6 py-4 text-slate-400">Google Sheets filters</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-white">No budget at all</td>
                        <td className="px-6 py-4 text-brand-accent">Utilize free tools first</td>
                        <td className="px-6 py-4 text-slate-400">ChatGPT + Native Sheets</td>
                    </tr>
                </tbody>
            </table>
          </div>

          <h2>Pro Tips to 10x Results</h2>
          <p>Basics working? It's time to go advanced.</p>
          <ul>
            <li><strong>Build AI agents:</strong> No-code platform on Scrayva.space can let you build completely autonomous research loops!</li>
            <li><strong>LinkedIn auto:</strong> Systematically engage with posts in your highly specific niche.</li>
            <li><strong>Voice search:</strong> Talk to Grok or AI voice modes for instant rapid-fire ideas while on the move.</li>
          </ul>
          
          <div className="bg-brand-primary border border-brand-accent rounded-xl p-6 my-8 text-center bg-opacity-10">
            <p className="text-xl font-bold text-white mb-2">Pop Quiz</p>
            <p className="text-slate-300">Which tool finds emails best? A) ChatGPT, B) Apollo. <br /><em>(Answer: B. Try it today!)</em></p>
          </div>

          {/* Download Graphical Ad replacing the icon infographic */}
          <div className="relative rounded-3xl overflow-hidden p-10 bg-gradient-to-tr from-brand-primary to-[#0f172a] border border-brand-accent my-16 shadow-[0_0_50px_rgba(139,92,246,0.2)] flex flex-col items-center">
            <h3 className="text-3xl font-headline font-black text-white text-center mt-0 mb-8">Grab Free Resources</h3>
            <div className="flex gap-6 justify-center flex-wrap mb-10 w-full">
                <div className="flex flex-col items-center justify-center bg-[#0b0f1a]/50 p-6 rounded-2xl w-40 backdrop-blur-md">
                    <span className="material-symbols-outlined text-green-400 text-5xl mb-2">checklist</span>
                    <span className="font-bold text-slate-200 text-center text-sm">8 Steps PDF Checklist</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-[#0b0f1a]/50 p-6 rounded-2xl w-40 backdrop-blur-md">
                    <span className="material-symbols-outlined text-blue-400 text-5xl mb-2">chat_bubble</span>
                    <span className="font-bold text-slate-200 text-center text-sm">25 ChatGPT Prompts</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-[#0b0f1a]/50 p-6 rounded-2xl w-40 backdrop-blur-md">
                    <span className="material-symbols-outlined text-yellow-400 text-5xl mb-2">table_view</span>
                    <span className="font-bold text-slate-200 text-center text-sm">Lead Tracker Sheet</span>
                </div>
            </div>
            <Link href="/signup" className="px-10 py-5 bg-white text-brand-primary hover:bg-slate-200 hover:scale-105 transition-all rounded-full font-bold shadow-2xl">
                [ Download Free Kit Now ]
            </Link>
          </div>

          <h2>🏁 Conclusion</h2>
          <p>
            AI automates client research so you can work smart. Save your valuable time, win vastly more reliable gigs, and start earning like Ramesh and Priya.
          </p>
          <ul className="mb-12">
            <li><strong>Define clients clearly.</strong></li>
            <li><strong>Use free tools first.</strong></li>
            <li><strong>Track and tweak weekly.</strong></li>
            <li><strong>Start with 10 leads today.</strong></li>
          </ul>

          {/* Inspirational Quote Graphic */}
          <div className="w-full h-80 bg-gradient-to-br from-[#0f172a] via-[#0b0f1a] to-brand-primary/40 rounded-3xl flex items-center justify-center p-12 border border-white/10 shadow-[inset_0_0_50px_rgba(139,92,246,0.1)] mb-8 text-center">
              <div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-accent mt-0 font-headline">"AI finds clients <br/>while you sleep."</h2>
                  <p className="text-lg text-brand-primary font-bold tracking-widest uppercase mt-6">— Ramesh</p>
              </div>
          </div>
          
        </article>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 mt-10 border-t border-white/5 bg-[#070b14]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="text-xl font-bold text-white font-headline mb-4">Scrayva</div>
            <p className="text-slate-500 max-w-sm text-sm leading-relaxed mb-6">
              The next generation of web automation. Scrayva empowers teams and students to scale their research operations through intelligent AI agents.
            </p>
            <div className="flex gap-4">
              <a className="text-slate-500 hover:text-brand-primary transition-colors" href="mailto:support@scrayva.space"><span className="material-symbols-outlined">mail</span></a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm mb-4">Legal</h4>
              <Link className="block text-slate-500 hover:text-white transition-colors text-sm" href="/privacy">Privacy Policy</Link>
              <Link className="block text-slate-500 hover:text-white transition-colors text-sm" href="/terms">Terms of Service</Link>
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm mb-4">Platform</h4>
              <Link className="block text-slate-500 hover:text-white transition-colors text-sm" href="/dashboard">Dashboard</Link>
              <Link className="block text-slate-500 hover:text-white transition-colors text-sm" href="/about">About Us</Link>
              <Link className="block text-slate-500 hover:text-white transition-colors text-sm" href="/pricing">Pricing</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
