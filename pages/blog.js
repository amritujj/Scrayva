import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Blog() {
  return (
    <div className="dark min-h-screen selection:bg-primary-container/30 text-on-surface bg-background font-body">
      <Head>
        <title>Scrayva Blog - AI Automation Insights | scrayva.space</title>
        <meta name="description" content="Learn web automation, lead generation, and business workflows with Scrayva. Discover how AI transforms your digital tasks." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        body { font-family: 'Inter', sans-serif; background-color: #0b0e14; color: #ecedf6; }
        .font-headline { font-family: 'Manrope', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { background: rgba(22, 26, 33, 0.6); backdrop-filter: blur(24px); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top Navigation Shell */}
      <Navbar />


      {/* Hero Header */}
      <header className="relative pt-44 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dim/20 via-surface to-background -z-10"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-surface-container-highest/50 border border-outline-variant/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-label uppercase tracking-widest text-primary-fixed-dim">Latest Updates</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter text-on-surface leading-[0.9] mb-8">
              Scrayva Blog — <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI Automation Insights</span>
            </h1>
            <p className="text-xl text-on-surface-variant font-body max-w-2xl mb-12 leading-relaxed">
              Master the art of web automation. Learn how to scale lead generation, optimize business workflows, and reclaim your time with AI-driven intelligence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-primary-dim to-secondary-dim text-on-primary font-bold rounded-xl flex items-center gap-2 hover:scale-[1.02] transition-transform active:scale-95">
                Start Free Trial
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <div className="flex -space-x-3 items-center ml-4">
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center overflow-hidden">
                  <img className="w-full h-full object-cover" data-alt="User avatar profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_2hNzrpfQ1G_S7hjqaGSRRj7iSw6hX0z4yza-rc542T1LGrnaNfvxKqGoRB-TIRF05SQhRBLVjgMefRHpIqRBcxgH6_y6L_F7UCQE7aVoUWth08RzyXr4fVVAZHzIGZrwWgxnUbscMiuHXtvrD7FsZaAHqYW2O8sWYC4xPDpMJghyH4PaPYeyMZppMD3yMttRGVRDFKOBBx1xu5wfa0eb9S28fX4bYphAJrNWUsWqHOpOHoGBuiFmkBAx_sGhwtTP77Wf82gn9WY" alt="User avatar" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center overflow-hidden">
                  <img className="w-full h-full object-cover" data-alt="User avatar profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3atDTB4DCxyPuK7Z-kTVc1YmKI2c3FT1ZeCQcnWD0jOU0QQTVVTnfO3SFsO7Qw1epewGRNEfZT2U5r_ulKPSEr9zsQdjMYzh1C0IeNM0Um0bnb76TeusM01CGZOr3ECPI_jOg4gWYRLV2DZG6ez9raFgFGILY4WtZwQBvaTmPnJZOTDV7Ls36FqO4xO2i8YI8HTuxbTV-GeFdcnlXY_C8-mONbpOftrKMXgJ-hIsx2QBRDgxncDF01MzmbCoxcXTNC2TCqLHPV5U" alt="User avatar" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center overflow-hidden">
                  <img className="w-full h-full object-cover" data-alt="User avatar profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqoHZ2oB6XpLv3oybfF0M9zV8srop7Yb5uMvcmG248dF-O9-zSHnJELxK8uziHBGZKP6_zjoo80m2Y99n0a-2LdFIjBNoHQ1LdK04uO0GLGDhmyvoTPmVGBUyaH3VbsrKdYce7xKyDS70zH7V5747BRv-fixaxB9YG-dDeV_fSxtpsaaUW3F9GRpxFQ6H0g9NIGsASiZ7FZX3PaoC5ffiN7wu4w2mY3lNtDhMLBfMRuWqn6qK9Et0YCVtIIKaN6pZOFyxlCJPQ6IY" alt="User avatar" />
                </div>
                <span className="pl-6 text-sm text-on-surface-variant font-medium">Join 5K+ Automators</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Scroll */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar pb-4">
          <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-sm">All Topics</button>
          <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-surface-container-low border border-outline-variant/10 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm">Web Automation</button>
          <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-surface-container-low border border-outline-variant/10 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm">Lead Generation</button>
          <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-surface-container-low border border-outline-variant/10 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm">Freelancer Tools</button>
          <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-surface-container-low border border-outline-variant/10 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm">Business Growth</button>
          <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-surface-container-low border border-outline-variant/10 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm">AI Workflows</button>
          <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-surface-container-low border border-outline-variant/10 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm">Competitor Analysis</button>
        </div>
      </section>

      {/* Featured Post */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="group relative grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl overflow-hidden bg-surface-container-low border border-primary/20 shadow-2xl shadow-primary/5">
          <div className="lg:col-span-7 overflow-hidden h-full min-h-[400px]">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-alt="Advanced dashboard showing automation workflows and data analytics" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB23M73Oi_aduMYjvtSuOQM68k-8iLONaGxEfxi0_GPmKPQoNOFtuOQKIA5-1Ybny1T0Tlrhj1ifkwrIKfj2IR_JK14OilQcB52gjuRzg78w1Y8lrH-NTEw52f9ifjblVNSAJyW_UflbL7W8V-VV-FHEqfn2t5ykJ-peEkeaYJOaT1ramMSa3ToyBpL7Yt8RiJfzQ1JwQetf1RQUxm9IKMRzwz8tty1XOxcy91w-wLWyUwp0wG_3EYfSwFPa1oezPZm_qb91A2mYug" alt="Dashboard" />
          </div>
          <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-primary/10 text-primary-fixed-dim text-[10px] font-bold tracking-[0.2em] uppercase rounded">Featured Guide</span>
              <span className="text-on-surface-variant text-xs font-medium">8 min read</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-headline font-bold text-on-surface leading-tight mb-6">
              How Scrayva Automates Lead Generation in 5 Minutes
            </h2>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              Stop manually scraping LinkedIn and Google Maps. Discover how our AI agents navigate complex websites to find verified leads while you sleep.
            </p>
            <div className="flex items-center justify-between mt-auto pt-8 border-t border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest">
                  <img className="w-full h-full object-cover rounded-full" data-alt="Author portrait Alex Rivera" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC71jHF_xCpeCTFr_muMMLGEC69LUt7mATYu-LXYdjlFi-R-INNOJzhCr0TVqLDQ-s46iRLW4TiBvqypluD3SuGF0gmBa0GqUOwMI04uQ9c6vL46sllvs-M2z9ddWcluhF3bKG2LBP6IPFdLLQBLv9hWws0uhD4L3N2a8NLCLbLRfeFPsLW-8kPvdNxW_NMN9oJPVl037XZWISxwVbfOATmy90Mm0mACXiFofkI3Tj2iXwL_HwI4652uRFFHgXUhfwetk4Q-2jtPgE" alt="Portrait" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Alex Rivera</p>
                  <p className="text-xs text-on-surface-variant">Product Specialist</p>
                </div>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Oct 12, 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts Grid */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h3 className="text-sm font-label uppercase tracking-widest text-primary mb-4">The Feed</h3>
            <h2 className="text-4xl font-headline font-bold">Latest Automation Trends</h2>
          </div>
          <div className="hidden md:flex gap-2">
            <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">view_list</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Post 1 */}
          <Link href="/blog/10-web-research-tasks" className="group flex flex-col bg-surface-container-low rounded-xl overflow-hidden hover:bg-surface-container transition-all duration-300 transform hover:-translate-y-1">
            <div className="aspect-[16/10] overflow-hidden">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Student studying with computer and automation icons" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN1XqXBrO57monrTjS5WgbgrYk9F4ppnl34pZK2i9HIzNKYHjtX00UZkRR7V4SdpAEaqM6U_F--2ucnNaHCBQiWaWxcZFxl02eSWAAxvmhYitq3hoEgs8y5-yyrl2_y6LblxvvwBxcM1K4rqa14nlhsYc2nrJS9kOUAznIZCKplF8KzVYbQUwA-3xI0nG1sqTF2RW_pbBmdd2fx7esRsAr_GaRD9b-bPVWp6kkA8Gr6UQLkbHjtTW01PSbavdouoHFcBMdbyr9YvA" alt="Student matching graphic" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary">Automation</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-medium">5 min read</span>
              </div>
              <h4 className="text-xl font-headline font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">10 Web Research Tasks Students Can Automate Today</h4>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-3">From compiling literature reviews to tracking grant deadlines, see how AI saves students hours.</p>
              <div className="mt-auto flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-dim/20"></div>
                <span className="text-xs font-semibold text-on-surface">Elena Vance</span>
              </div>
            </div>
          </Link>
          {/* Post 2 */}
          <Link href="/blog/freelancer-guide-automate-client-research" className="group flex flex-col bg-surface-container-low rounded-xl overflow-hidden hover:bg-surface-container transition-all duration-300 transform hover:-translate-y-1">
            <div className="aspect-[16/10] overflow-hidden">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Freelancer working on laptop in a modern cafe" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD38E0CwLjE2vWcsAzyIDqFIhjXJIRExFiTzW5DubVezQIGWpEzAopS6GkCsSayCQL9aPU_Kx593YB-UKw09PNcTSZ2WrTGil4znaRkThIxvZLPhigz4IgyMFEutdqqycwnBaAXz_5Wez3j8lu0ejo3S5Uo6pcTOJq7s0goDu8eW4QKt7U8PpwZordHT1j_M9orjN39FM3l1XtvKzmwznv4omV0VF9Lvfh5XLIxY8ANIwMzGr5TGPjIi_kFWnwTOOrPx7M_AGbh18U" alt="Freelancer image" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-tertiary/10 text-tertiary">Freelance</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-medium">12 min read</span>
              </div>
              <h4 className="text-xl font-headline font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">Freelancer Guide: Automate Client Research with AI</h4>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-3">Stop cold pitching blindly. Use Scrayva to build detailed profiles of potential clients automatically.</p>
              <div className="mt-auto flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary-dim/20"></div>
                <span className="text-xs font-semibold text-on-surface">Jordan Smith</span>
              </div>
            </div>
          </Link>
          {/* Post 3 */}
          <Link href="/blog" className="group flex flex-col bg-surface-container-low rounded-xl overflow-hidden hover:bg-surface-container transition-all duration-300 transform hover:-translate-y-1">
            <div className="aspect-[16/10] overflow-hidden">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Stock market chart showing price fluctuations" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfyfp9YINs4tHtjj1q7mRNi9DU-q9gueYhU403A7l7EFwZn-THwhC6Si-z3sONylADy0dz1rQdyzO40lw4Mzvj24BKUs-UDXw2-jV9lxvpW_tTGhOfNblh1j2XnSMsXHM3K0kwbHP-Db0oetdNxBZHfU6iDFNPpjfCOxxibVOJM4W5dOQAUApxlu-xdUbTL_ZeY9ngjZH3l-Jb96lMJ35mCEIe5KLw2gH-LSE0AdCdwV69mDGE8_ZhbkMaQR3BQn50NlqmIaCLgUY" alt="Stock Market data" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">Business</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-medium">7 min read</span>
              </div>
              <h4 className="text-xl font-headline font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">Competitor Price Tracking: Save 20 Hours Weekly</h4>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-3">Automatic monitoring of e-commerce prices to keep your business competitive without manual checks.</p>
              <div className="mt-auto flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-tertiary-dim/20"></div>
                <span className="text-xs font-semibold text-on-surface">Marcus Chen</span>
              </div>
            </div>
          </Link>
          {/* Post 4 */}
          <Link href="/blog" className="group flex flex-col bg-surface-container-low rounded-xl overflow-hidden hover:bg-surface-container transition-all duration-300 transform hover:-translate-y-1">
            <div className="aspect-[16/10] overflow-hidden">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Business team meeting in a dark office" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYQQhvoIEjp02imZkJ3swVd-31gjcemxBCHetdzZP6w1z1yztoZTD-GD3IYmO2NVlmivdOUuGV4SMj-dLhM8BDaOd5cshAQxUTkqYLjBExDGa6ZgyneLXOMaB9nZjDpm1Wj3o5KqJE1u8pTNwhdjgv2V4dSX84ywvYgFEbTQE2B0KIEFt06t85V0SVUaqPhvI4hC4V1Lg4khw4TKJx4eo3fQArLna_lPWjojcKJsqS8OTxjwW0RiWTa_wwRUYRDtc2fra0p_gzM3Q" alt="Business team graphic" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary">Business</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-medium">10 min read</span>
              </div>
              <h4 className="text-xl font-headline font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">Lead Generation Automation for Small Businesses</h4>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-3">Affordable ways for small shops to build massive prospect lists using modern AI scrapers.</p>
              <div className="mt-auto flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-dim/20"></div>
                <span className="text-xs font-semibold text-on-surface">Sarah Bloom</span>
              </div>
            </div>
          </Link>
          {/* Post 5 */}
          <Link href="/blog" className="group flex flex-col bg-surface-container-low rounded-xl overflow-hidden hover:bg-surface-container transition-all duration-300 transform hover:-translate-y-1">
            <div className="aspect-[16/10] overflow-hidden relative">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Abstract view of Delhi city landscape" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkdFHU0JcAk28_yrt1ACCQCB7-H9oOIj6nvLHFu-uaoxAWkBmew1e1xU3hDDgtwVEvOv2OvhR_ht5RkW_c31NMfVYHGO35ZHTElB0zn4rd575rbAF1Xqoc2e1uRmpvaOI1KaQ3FzBiF2rZssHWjCM6vF6XxHESH94EJn-EhNUqAuEdXQOQpps0yIignzmHU7DPDa-D6aZP0zTz_Qc1IQKPinrWqwuawvglPD-BKUGsfxbsAmRG5UIBr9jFUdPI3Az_DG5geoUi9Os" alt="City view abstract" />
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white">CASE STUDY</div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">Automation</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-medium">6 min read</span>
              </div>
              <h4 className="text-xl font-headline font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">How Scrayva Found 500 Coaching Centers in Delhi</h4>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-3">A deep dive into localized lead generation at scale across specialized educational sectors.</p>
              <div className="mt-auto flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary-dim/20"></div>
                <span className="text-xs font-semibold text-on-surface">Deepak Rao</span>
              </div>
            </div>
          </Link>
          {/* Post 6 */}
          <Link href="/blog" className="group flex flex-col bg-surface-container-low rounded-xl overflow-hidden hover:bg-surface-container transition-all duration-300 transform hover:-translate-y-1">
            <div className="aspect-[16/10] overflow-hidden">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Circuit board close up with neon lights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVLNO2cW8XapQ-scrs2eF6mU-AaAbV1yM2ZZBpige9uWuE8pP4wwWUU3WzRd43x_1TdAWR6UIWer0Xfx5ZXirIRLf_SYzX-2PWa6QzMuwISVsDxuEUWvFi-Ny8eSne2oaahq0zfDSBcn6ar3v9LKxS5kJS2jDAeovsCIky28kL6w2mV6551eF_fK0BAS1G0uend5sRa5KLS5oF75WkjS08KQZrQwVXEEZqaBrTxZ2ngdPoV_fI9Y5a0FgdNy2VqHxW62Wr0WSmlC0" alt="Tech neon board" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-tertiary/10 text-tertiary">Freelance</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-medium">15 min read</span>
              </div>
              <h4 className="text-xl font-headline font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">Browser Automation vs Manual Work: Cost Analysis</h4>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-3">The real ROI of automation. We break down the math of manual labor vs AI subscription costs.</p>
              <div className="mt-auto flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-tertiary-dim/20"></div>
                <span className="text-xs font-semibold text-on-surface">Liam Carter</span>
              </div>
            </div>
          </Link>
        </div>
        <div className="flex justify-center mt-20">
          <button onClick={() => window.scrollTo(0, 0)} className="px-12 py-4 rounded-xl bg-surface-container-high border border-outline-variant/20 hover:border-primary/50 text-on-surface font-semibold transition-all">Load More Stories</button>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-7xl mx-auto px-6 mt-40">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-surface-container-high to-surface-container-lowest border border-white/5 p-8 md:p-16">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] -z-10"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-6 leading-tight">
                Automate Your First Task Free
              </h2>
              <p className="text-xl text-on-surface-variant mb-8">
                Experience the power of Scrayva without spending a dime. Set up your first workflow in under 2 minutes.
              </p>
              <div className="flex flex-wrap gap-12 items-center">
                <Link href="/signup" className="px-10 py-5 bg-gradient-to-r from-primary-dim to-secondary-dim text-on-primary font-bold rounded-xl shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                  Start Building Now
                </Link>
                <div className="flex flex-col">
                  <span className="text-3xl font-headline font-black text-white">5K+</span>
                  <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Tasks Automated</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="glass-card border border-white/10 rounded-2xl p-6 rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 w-full bg-white/5 rounded"></div>
                  <div className="h-2 w-4/5 bg-white/5 rounded"></div>
                  <div className="h-2 w-full bg-primary/20 rounded"></div>
                  <div className="h-2 w-2/3 bg-white/5 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-20 mt-20 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="text-xl font-bold text-white font-manrope mb-6">Scrayva</div>
            <p className="text-zinc-500 max-w-sm font-manrope text-sm leading-relaxed">
              The next generation of web automation. Scrayva empowers teams to scale their research and data operations through intelligent AI agents.
            </p>
            <div className="flex gap-4 mt-8">
              <a className="text-zinc-500 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
              <a className="text-zinc-500 hover:text-primary transition-colors" href="mailto:support@scrayva.space"><span className="material-symbols-outlined">mail</span></a>
              <a className="text-zinc-500 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">terminal</span></a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm mb-6">Legal</h4>
              <Link className="block text-zinc-500 hover:text-violet-400 transition-colors font-manrope text-sm hover:translate-x-1" href="/privacy">Privacy Policy</Link>
              <Link className="block text-zinc-500 hover:text-violet-400 transition-colors font-manrope text-sm hover:translate-x-1" href="/terms">Terms of Service</Link>
              <a className="block text-zinc-500 hover:text-violet-400 transition-colors font-manrope text-sm hover:translate-x-1" href="mailto:support@scrayva.space">Security</a>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm mb-6">Platform</h4>
              <Link className="block text-zinc-500 hover:text-violet-400 transition-colors font-manrope text-sm hover:translate-x-1" href="/dashboard">Dashboard</Link>
              <Link className="block text-zinc-500 hover:text-violet-400 transition-colors font-manrope text-sm hover:translate-x-1" href="/about">About Us</Link>
              <Link className="block text-zinc-500 hover:text-violet-400 transition-colors font-manrope text-sm hover:translate-x-1" href="/#pricing">Pricing</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 font-manrope text-xs">© 2024 Scrayva Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-zinc-500 hover:text-white transition-colors text-xs font-medium" href="#">Cookie Policy</a>
            <a className="text-zinc-500 hover:text-white transition-colors text-xs font-medium" href="#">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
