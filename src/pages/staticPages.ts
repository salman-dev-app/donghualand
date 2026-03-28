import { layout } from './layout'

type SiteSettings = Record<string, string>

export function aboutPage(settings: SiteSettings = {}): string {
  const siteName = settings.site_name || 'DonghuaLand'
  const siteDesc = settings.site_description || 'Your ultimate destination for Chinese anime (Donghua) streaming'
  const contactEmail = settings.about_email || settings.contact_email || ''
  const discord = settings.social_discord || ''
  const twitter = settings.social_twitter || ''

  const content = `
<div class="static-page-wrap">
  <div class="static-hero">
    <div class="static-hero-icon"><i class="fas fa-dragon"></i></div>
    <h1>About <span>${siteName}</span></h1>
    <p>${siteDesc}</p>
  </div>

  <div class="static-content">
    <div class="static-section">
      <h2><i class="fas fa-info-circle"></i> What is ${siteName}?</h2>
      <p>${siteName} is a free online platform dedicated to streaming Chinese animated series, commonly known as Donghua. We bring you the best of Chinese animation with high-quality video, English subtitles, and a seamless viewing experience.</p>
      <p>Whether you're a long-time fan of cultivation stories, historical epics, or action-packed adventures, ${siteName} has something for everyone.</p>
    </div>

    <div class="static-section">
      <h2><i class="fas fa-star"></i> Our Mission</h2>
      <p>Our mission is to make Chinese animation accessible to global audiences. We believe in the power of storytelling through animation and strive to provide the best viewing experience possible — completely free of charge.</p>
    </div>

    <div class="static-cards">
      <div class="static-card">
        <i class="fas fa-film"></i>
        <h3>500+ Series</h3>
        <p>A vast library of Donghua titles across all genres</p>
      </div>
      <div class="static-card">
        <i class="fas fa-closed-captioning"></i>
        <h3>Subtitles</h3>
        <p>English subtitles for all available series</p>
      </div>
      <div class="static-card">
        <i class="fas fa-bolt"></i>
        <h3>Fast Updates</h3>
        <p>New episodes added as soon as they air</p>
      </div>
      <div class="static-card">
        <i class="fas fa-lock-open"></i>
        <h3>Free Forever</h3>
        <p>No subscription required to watch</p>
      </div>
    </div>

    <div class="static-section">
      <h2><i class="fas fa-envelope"></i> Contact Us</h2>
      <p>Have questions or suggestions? We'd love to hear from you!</p>
      ${contactEmail ? `<p>Email: <a href="mailto:${contactEmail}" style="color:var(--purple2)">${contactEmail}</a></p>` : ''}
      ${discord ? `<p>Discord: <a href="${discord.startsWith('http') ? discord : 'https://discord.gg/' + discord}" target="_blank" style="color:var(--purple2)">${discord}</a></p>` : ''}
      ${twitter ? `<p>Twitter: <a href="${twitter.startsWith('http') ? twitter : 'https://twitter.com/' + twitter.replace('@','')}" target="_blank" style="color:var(--purple2)">${twitter}</a></p>` : ''}
    </div>
  </div>
</div>
`
  return layout(`About Us - ${siteName}`, content, '', siteName)
}

export function contactPage(settings: SiteSettings = {}): string {
  const siteName = settings.site_name || 'DonghuaLand'
  const contactEmail = settings.contact_email || ''
  const discord = settings.social_discord || ''
  const twitter = settings.social_twitter || ''
  const reddit = settings.social_reddit || ''
  const telegram = settings.social_telegram || ''

  const content = `
<div class="static-page-wrap">
  <div class="static-hero">
    <div class="static-hero-icon"><i class="fas fa-envelope"></i></div>
    <h1>Contact <span>Us</span></h1>
    <p>Get in touch with the ${siteName} team</p>
  </div>

  <div class="static-content">
    <div class="contact-grid">
      <div>
        <div class="static-section">
          <h2>Send a Message</h2>
          <form class="contact-form" onsubmit="submitContact(event)">
            <div class="form-group">
              <label>Your Name</label>
              <input type="text" class="form-inp" placeholder="John Doe" required>
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" class="form-inp" placeholder="john@example.com" required>
            </div>
            <div class="form-group">
              <label>Subject</label>
              <select class="form-sel">
                <option>General Inquiry</option>
                <option>Report a Bug</option>
                <option>Request an Anime</option>
                <option>DMCA Notice</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Message</label>
              <textarea class="form-inp" rows="5" placeholder="Your message..." required style="resize:vertical"></textarea>
            </div>
            <button type="submit" class="btn-primary-sm" style="width:100%">
              <i class="fas fa-paper-plane"></i> Send Message
            </button>
          </form>
        </div>
      </div>
      <div>
        <div class="static-section">
          <h2>Other Ways to Reach Us</h2>
          <div class="contact-items">
            ${contactEmail ? `
            <div class="contact-item">
              <i class="fas fa-envelope" style="color:var(--purple2)"></i>
              <div>
                <strong>Email</strong>
                <a href="mailto:${contactEmail}">${contactEmail}</a>
              </div>
            </div>` : ''}
            ${discord ? `
            <div class="contact-item">
              <i class="fab fa-discord" style="color:#5865F2"></i>
              <div>
                <strong>Discord</strong>
                <a href="${discord.startsWith('http') ? discord : 'https://discord.gg/' + discord}" target="_blank">${discord}</a>
              </div>
            </div>` : ''}
            ${twitter ? `
            <div class="contact-item">
              <i class="fab fa-twitter" style="color:#1DA1F2"></i>
              <div>
                <strong>Twitter / X</strong>
                <a href="${twitter.startsWith('http') ? twitter : 'https://twitter.com/' + twitter.replace('@','')}" target="_blank">${twitter}</a>
              </div>
            </div>` : ''}
            ${reddit ? `
            <div class="contact-item">
              <i class="fab fa-reddit" style="color:#FF4500"></i>
              <div>
                <strong>Reddit</strong>
                <a href="${reddit.startsWith('http') ? reddit : 'https://reddit.com/r/' + reddit.replace('r/','')}" target="_blank">${reddit}</a>
              </div>
            </div>` : ''}
            ${telegram ? `
            <div class="contact-item">
              <i class="fab fa-telegram" style="color:#229ED9"></i>
              <div>
                <strong>Telegram</strong>
                <a href="${telegram.startsWith('http') ? telegram : 'https://t.me/' + telegram.replace('@','')}" target="_blank">${telegram}</a>
              </div>
            </div>` : ''}
          </div>
          <div class="contact-note">
            <i class="fas fa-clock"></i>
            Response time: Usually within 24-48 hours.
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
window.submitContact = function(e) {
  e.preventDefault();
  window.showToast('Message sent! We will get back to you soon.', 'success');
  e.target.reset();
};
</script>
`
  return layout(`Contact Us - ${siteName}`, content, '', siteName)
}

export function privacyPage(settings: SiteSettings = {}): string {
  const siteName = settings.site_name || 'DonghuaLand'
  const privacyEmail = settings.privacy_email || settings.contact_email || ''

  const content = `
<div class="static-page-wrap">
  <div class="static-hero">
    <div class="static-hero-icon"><i class="fas fa-shield-alt"></i></div>
    <h1>Privacy <span>Policy</span></h1>
    <p>Last updated: January 1, 2026</p>
  </div>
  <div class="static-content">
    <div class="legal-doc">
      <div class="static-section">
        <h2>1. Information We Collect</h2>
        <p>When you register for an account, we collect your username, email address, and password (hashed). We also collect usage data such as which anime you watch and your watchlist.</p>
      </div>
      <div class="static-section">
        <h2>2. How We Use Your Information</h2>
        <p>We use your information to provide personalized recommendations, save your watchlist and history, and improve our service. We do not sell your personal information to third parties.</p>
      </div>
      <div class="static-section">
        <h2>3. Cookies</h2>
        <p>We use cookies and localStorage to keep you logged in and save your preferences. You can clear these through your browser settings at any time.</p>
      </div>
      <div class="static-section">
        <h2>4. Third-Party Services</h2>
        <p>We use Google Fonts, Font Awesome, and CDN services to deliver content. These services may collect anonymous usage data per their own privacy policies.</p>
      </div>
      <div class="static-section">
        <h2>5. Data Security</h2>
        <p>We implement industry-standard security measures to protect your data. Passwords are hashed and never stored in plain text.</p>
      </div>
      <div class="static-section">
        <h2>6. Contact</h2>
        <p>For privacy concerns, contact us at ${privacyEmail
          ? `<a href="mailto:${privacyEmail}" style="color:var(--purple2)">${privacyEmail}</a>`
          : `<a href="/contact" style="color:var(--purple2)">our contact page</a>`}</p>
      </div>
    </div>
  </div>
</div>
`
  return layout(`Privacy Policy - ${siteName}`, content, '', siteName)
}

export function termsPage(settings: SiteSettings = {}): string {
  const siteName = settings.site_name || 'DonghuaLand'

  const content = `
<div class="static-page-wrap">
  <div class="static-hero">
    <div class="static-hero-icon"><i class="fas fa-file-contract"></i></div>
    <h1>Terms of <span>Service</span></h1>
    <p>Last updated: January 1, 2026</p>
  </div>
  <div class="static-content">
    <div class="legal-doc">
      <div class="static-section">
        <h2>1. Acceptance of Terms</h2>
        <p>By using ${siteName}, you agree to these terms. If you do not agree, please do not use our service.</p>
      </div>
      <div class="static-section">
        <h2>2. Use of Service</h2>
        <p>${siteName} is provided for personal, non-commercial use. You may not use our service for any illegal purpose or in violation of any regulations.</p>
      </div>
      <div class="static-section">
        <h2>3. Content</h2>
        <p>${siteName} does not host any video files. All video content is served from third-party sources. We only provide a web interface to access publicly available content.</p>
      </div>
      <div class="static-section">
        <h2>4. User Accounts</h2>
        <p>You are responsible for maintaining the security of your account. You must not share your credentials or use someone else's account.</p>
      </div>
      <div class="static-section">
        <h2>5. Disclaimer</h2>
        <p>${siteName} is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access or availability of any specific content.</p>
      </div>
      <div class="static-section">
        <h2>6. Changes</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
      </div>
    </div>
  </div>
</div>
`
  return layout(`Terms of Service - ${siteName}`, content, '', siteName)
}

export function dmcaPage(settings: SiteSettings = {}): string {
  const siteName = settings.site_name || 'DonghuaLand'
  const dmcaEmail = settings.dmca_email || settings.contact_email || ''

  const content = `
<div class="static-page-wrap">
  <div class="static-hero">
    <div class="static-hero-icon"><i class="fas fa-gavel"></i></div>
    <h1>DMCA <span>Notice</span></h1>
    <p>Copyright Infringement Policy</p>
  </div>
  <div class="static-content">
    <div class="legal-doc">
      <div class="static-section">
        <h2>DMCA Compliance</h2>
        <p>${siteName} respects the intellectual property rights of others and expects users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond to notices of alleged copyright infringement.</p>
      </div>
      <div class="static-section">
        <h2>Our Position</h2>
        <p>${siteName} does not host, store, or distribute any video content. We are a platform that indexes and links to content available on the internet. All video content is hosted on third-party servers.</p>
      </div>
      <div class="static-section">
        <h2>Filing a DMCA Notice</h2>
        <p>If you believe your copyrighted work has been used in a way that constitutes infringement, please send a notice to:</p>
        ${dmcaEmail ? `
        <div class="contact-item" style="margin: 16px 0">
          <i class="fas fa-envelope" style="color:var(--purple2)"></i>
          <div>
            <strong>DMCA Agent</strong>
            <a href="mailto:${dmcaEmail}">${dmcaEmail}</a>
          </div>
        </div>` : `
        <div class="contact-item" style="margin: 16px 0">
          <i class="fas fa-envelope" style="color:var(--purple2)"></i>
          <div>
            <strong>DMCA Agent</strong>
            <a href="/contact">Use our contact form</a>
          </div>
        </div>`}
        <p>Your notice must include: (1) identification of the copyrighted work, (2) identification of the infringing material, (3) your contact information, (4) a statement of good faith belief, (5) a statement of accuracy under penalty of perjury, (6) your signature.</p>
      </div>
    </div>
  </div>
</div>
`
  return layout(`DMCA Notice - ${siteName}`, content, '', siteName)
}
