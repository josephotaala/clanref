const STORAGE_KEY = 'isorre-clan-office';

const defaultData = {
    accounts: [
        { name: 'Isorre Okafor', email: 'head@isorre.org', password: 'isorre2026', role: 'head', status: 'Active' },
        { name: 'Amara Nwosu', email: 'amara@isorre.org', password: 'welcome2026', role: 'member', status: 'Active' }
    ],
    members: [
        { name: 'Amara Nwosu', role: 'Clan secretary', joined: '12 Sep 2026', status: 'Active', initials: 'AN' },
        { name: 'Chidi Okafor', role: 'Community elder', joined: '09 Sep 2026', status: 'Active', initials: 'CO' },
        { name: 'Nneka Eze', role: 'Member', joined: '04 Sep 2026', status: 'Pending', initials: 'NE' }
    ],
    activities: [
        { title: 'Community clean-up', date: '18 Sep 2026', lead: 'Chidi Okafor', note: 'Quarterly clean-up around the family compound.' },
        { title: 'New yam gathering', date: '06 Sep 2026', lead: 'Amara Nwosu', note: 'A warm afternoon of food, stories, and music.' }
    ],
    meetings: [
        { title: 'October family council', date: '03 Oct 2026', time: '16:00', place: 'Isorre family hall', note: 'Planning for the end-of-year gathering.' },
        { title: 'Welcome circle', date: '26 Sep 2026', time: '15:30', place: 'Nwosu courtyard', note: 'Meet the newest members of the clan.' }
    ],
    photos: []
};

let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || defaultData;
data.accounts = data.accounts || defaultData.accounts;
data.members = data.members || [];
let currentView = 'home';
let currentUser = null;
const view = document.getElementById('appView');
const loginScreen = document.getElementById('loginScreen');
const appShell = document.querySelector('.app-shell');
const viewHistory = [];
const clanInfoModal = document.getElementById('clanInfoModal');

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
function initials(name) { return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase(); }
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message; toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
}
function emptyState(title, copy) { return `<div class="empty-state"><strong>${title}</strong><span>${copy}</span></div>`; }
function pageHeading(title, copy, action = '') { return `<div class="view-heading"><div><h2>${title}</h2><p>${copy}</p></div>${action}</div>`; }
function isHead() { return currentUser?.role === 'head'; }
function renderPending() { return `<section class="panel pending-panel"><div class="pending-icon">◷</div><h2>Registration received</h2><p>Welcome to the Isorre clan, ${escapeHtml(currentUser.name)}. Your account is waiting for authentication by the Clan Head. Records will unlock as soon as your membership is approved.</p><button class="secondary-btn logout-btn" data-logout>Sign out</button></section>`; }
function renderHome() { return `<section class="panel home-page"><div class="home-content"><span class="home-kicker">WELCOME TO THE ISORRE CLAN</span><h2 class="home-title">Feel at <i>home</i>, Joseph.</h2><p class="home-copy">East or West, home is the best. We are a family connected by shared roots, warm gatherings, and memories worth keeping.</p><div class="home-actions"><button class="primary-btn" data-action="overview">Open records dashboard →</button><button class="secondary-btn" data-action="gallery">Visit family gallery</button></div><span class="home-heart">✦</span></div></section>`; }
function render() {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === currentView));
    if (currentUser?.status === 'Pending') { view.innerHTML = renderPending(); return; }
    document.getElementById('meetingBadge').textContent = data.meetings.length;
    const titles = { home: 'Welcome home, Joseph.', overview: 'Records dashboard', members: 'Clan members', activities: 'Clan activities', meetings: 'Meetings & notices', gallery: 'Family gallery', head: 'Clan head' };
    document.getElementById('pageTitle').textContent = titles[currentView];
    view.innerHTML = ({ home: renderHome, overview: renderOverview, members: renderMembers, activities: renderActivities, meetings: renderMeetings, gallery: renderGallery, head: renderHead }[currentView])();
    bindViewEvents();
}
function renderHead() { const pending = data.members.filter(member => member.status === 'Pending'); return `${pageHeading('Clan head office', 'A clear view of the people, rhythm, and responsibilities of Isorre.', '<button class="secondary-btn" data-action="members">Review registrations →</button>')}<div class="dashboard-grid"><section class="panel"><div class="panel-title"><h3>Head of clan</h3><span class="status active">Current</span></div><div class="member-row"><div class="person-avatar gold">IO</div><div class="row-main"><strong>Isorre Okafor</strong><span>Clan head · Stewardship since 2018</span></div></div><div class="panel-title" style="margin:24px 0 10px"><h3>Office snapshot</h3></div><div class="member-row"><div class="activity-mark">♧</div><div class="row-main"><strong>${data.members.length} registered members</strong><span>${pending.length} awaiting review</span></div></div><div class="member-row"><div class="activity-mark">◷</div><div class="row-main"><strong>${data.meetings.length} upcoming notices</strong><span>Next: ${escapeHtml(data.meetings[0]?.title || 'No meeting scheduled')}</span></div></div></section><section class="panel"><div class="panel-title"><h3>Membership approvals</h3><span class="status ${pending.length ? 'pending' : 'active'}">${pending.length} pending</span></div>${pending.length ? pending.map(member => `<div class="member-row"><div class="person-avatar">${escapeHtml(member.initials)}</div><div class="row-main"><strong>${escapeHtml(member.name)}</strong><span>${escapeHtml(member.email || 'New registration')} · Awaiting authentication</span></div><button class="secondary-btn" data-approve="${escapeHtml(member.email || member.name)}">Approve</button></div>`).join('') : emptyState('All registrations are approved', 'New member requests will appear here.')}</section></div>`; }
function renderOverview() {
    const upcoming = data.meetings.slice(0, 2);
    return `<section class="panel welcome-panel"><div><p class="eyebrow">CLAN OFFICE CHECK-IN</p><h2>Welcome, Joseph.</h2><p>Feel at home. East or West, home is the best.</p><span class="welcome-subcopy">We are a family. Blood is thicker than water.</span><span class="welcome-subcopy">Your clan is growing beautifully. Here is today's office snapshot.</span></div><span class="welcome-mark">✦</span></section><div class="stats-grid">
		<div class="stat-card"><span class="stat-label">TOTAL MEMBERS</span><div class="stat-value">${data.members.length}</div><div class="stat-foot"><span class="up">+${data.members.filter(member => member.joined.includes('2026')).length}</span> joined this season</div></div>
		<div class="stat-card"><span class="stat-label">ACTIVE MEMBERS</span><div class="stat-value">${data.members.filter(member => member.status === 'Active').length}</div><div class="stat-foot">of ${data.members.length} registered members</div></div>
		<div class="stat-card"><span class="stat-label">ACTIVITIES LOGGED</span><div class="stat-value">${data.activities.length}</div><div class="stat-foot">Across the clan calendar</div></div>
		<div class="stat-card"><span class="stat-label">UPCOMING MEETINGS</span><div class="stat-value">${data.meetings.length}</div><div class="stat-foot">Next: ${data.meetings[0]?.date || 'None scheduled'}</div></div>
	</div>
	<div class="dashboard-grid"><section class="panel"><div class="panel-title"><h3>Recent registrations</h3><button class="text-btn" data-action="members">View all →</button></div>${data.members.slice(0, 4).map(memberRow).join('')}</section>
	<section class="panel"><div class="panel-title"><h3>Next meetings</h3><button class="text-btn" data-action="meetings">Calendar →</button></div>${upcoming.length ? upcoming.map(meetingRow).join('') : emptyState('No meetings yet', 'Create the first clan notice.')}</section></div>
	<section class="panel" style="margin-top:18px"><div class="panel-title"><h3>Latest activity reports</h3><button class="text-btn" data-action="activities">All reports →</button></div>${data.activities.slice(0, 3).map(activityRow).join('') || emptyState('No activity reports', 'Log the clan\'s next gathering.')}</section>`;
}
function memberRow(member) { return `<div class="member-row"><div class="person-avatar">${escapeHtml(member.initials || initials(member.name))}</div><div class="row-main"><strong>${escapeHtml(member.name)}</strong><span>${escapeHtml(member.role)} · Joined ${escapeHtml(member.joined)}</span></div><span class="status ${member.status.toLowerCase()}">${escapeHtml(member.status)}</span></div>`; }
function activityRow(activity) { return `<div class="activity-row"><div class="activity-mark">✦</div><div class="row-main"><strong>${escapeHtml(activity.title)}</strong><span>${escapeHtml(activity.date)} · Led by ${escapeHtml(activity.lead)}</span></div><span class="text-btn">Report</span></div>`; }
function meetingRow(meeting) { const date = new Date(meeting.date); return `<div class="meeting-row"><div class="meeting-date"><b>${Number.isNaN(date.getTime()) ? '--' : date.getDate()}</b><span>${Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en', { month: 'short' }).toUpperCase()}</span></div><div class="row-main"><strong>${escapeHtml(meeting.title)}</strong><span>${escapeHtml(meeting.time)} · ${escapeHtml(meeting.place)}</span></div></div>`; }
function renderMembers() { return `${pageHeading('Clan members', 'Track every registration and keep the family roll current.', isHead() ? '<button class="primary-btn" data-modal="member">＋ Register member</button>' : '')}<section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>MEMBER</th><th>ROLE</th><th>JOINED</th><th>STATUS</th>${isHead() ? '<th>ACTION</th>' : ''}</tr></thead><tbody>${data.members.map(member => `<tr><td><strong>${escapeHtml(member.name)}</strong></td><td>${escapeHtml(member.role)}</td><td>${escapeHtml(member.joined)}</td><td><span class="status ${member.status.toLowerCase()}">${escapeHtml(member.status)}</span></td>${isHead() ? `<td>${member.status === 'Pending' ? `<button class="secondary-btn" data-approve="${escapeHtml(member.email || member.name)}">Approve</button>` : '—'}</td>` : ''}</tr>`).join('')}</tbody></table></div></section>`; }
function renderActivities() { return `${pageHeading('Clan activities', 'Record what the clan has done and build a living history.', '<button class="primary-btn" data-modal="activity">＋ New activity report</button>')}<section class="panel">${data.activities.map(activityRow).join('') || emptyState('No reports yet', 'Your first report will appear here.')}</section>`; }
function renderMeetings() { return `${pageHeading('Meetings & notices', 'Keep the whole clan in step with upcoming gatherings.', '<button class="primary-btn" data-modal="meeting">＋ Schedule meeting</button>')}<section class="panel">${data.meetings.map(meetingRow).join('') || emptyState('No meetings scheduled', 'Add a meeting to notify the clan.')}</section>`; }
function renderGallery() { return `${pageHeading('Family gallery', 'A shared visual record of the people and moments that matter.', '<button class="primary-btn" data-action="upload">＋ Add photos</button>')}<section class="panel">${data.photos.length ? `<div class="photo-grid">${data.photos.map(photo => `<div class="photo-card"><img src="${photo.src}" alt="${escapeHtml(photo.caption)}"><div class="photo-caption">${escapeHtml(photo.caption)}</div></div>`).join('')}</div>` : emptyState('The gallery is waiting for its first memory', 'Upload a photo from a clan gathering to begin.')}</section><input type="file" id="photoInput" accept="image/*" multiple hidden>`; }

function modal(type) {
    const configs = { member: ['Register a new member', `<div class="form-grid"><div class="field"><label>FULL NAME</label><input name="name" required placeholder="e.g. Adaobi Okeke"></div><div class="field"><label>ROLE IN CLAN</label><select name="role"><option>Member</option><option>Community elder</option><option>Clan secretary</option><option>Youth representative</option></select></div></div>`], activity: ['Report a clan activity', `<div class="form-grid"><div class="field full"><label>ACTIVITY NAME</label><input name="title" required placeholder="e.g. Community clean-up"></div><div class="field"><label>DATE</label><input type="date" name="date" required></div><div class="field"><label>ACTIVITY LEAD</label><input name="lead" required placeholder="Member name"></div><div class="field full"><label>SHORT REPORT</label><textarea name="note" placeholder="What happened? Who took part?"></textarea></div></div>`], meeting: ['Schedule a clan meeting', `<div class="form-grid"><div class="field full"><label>MEETING TITLE</label><input name="title" required placeholder="e.g. October family council"></div><div class="field"><label>DATE</label><input type="date" name="date" required></div><div class="field"><label>TIME</label><input type="time" name="time" required></div><div class="field full"><label>LOCATION</label><input name="place" required placeholder="Meeting place"></div><div class="field full"><label>NOTICE</label><textarea name="note" placeholder="What should members know?"></textarea></div></div>`] };
    const [title, body] = configs[type]; document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-modal-backdrop><form class="modal" data-form="${type}"><div class="modal-header"><h2>${title}</h2><button type="button" class="close-btn" data-close>×</button></div>${body}<div class="form-actions"><button type="button" class="secondary-btn" data-close>Cancel</button><button class="primary-btn" type="submit">Save record</button></div></form></div>`);
}
function bindViewEvents() {
    document.querySelectorAll('[data-modal]').forEach(button => button.addEventListener('click', () => modal(button.dataset.modal)));
    document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => { if (button.dataset.action === 'upload') document.getElementById('photoInput').click(); else { if (button.dataset.action !== currentView) viewHistory.push(currentView); currentView = button.dataset.action; render(); } }));
    const input = document.getElementById('photoInput'); if (input) input.addEventListener('change', uploadPhotos);
}
document.addEventListener('click', event => {
    const viewButton = event.target.closest('[data-view]');
    if (viewButton) { if (viewButton.dataset.view !== currentView) viewHistory.push(currentView); currentView = viewButton.dataset.view; render(); }
    if (event.target.matches('[data-close], [data-modal-backdrop]')) event.target.closest('[data-modal-backdrop]')?.remove();
    if (event.target.id === 'notificationBtn') { currentView = 'meetings'; render(); }
    if (event.target.closest('#clanInfoBtn')) { clanInfoModal.hidden = false; }
    if (event.target.matches('[data-close-info]') || event.target === clanInfoModal) { clanInfoModal.hidden = true; }
    if (event.target.closest('#backBtn')) { currentView = viewHistory.pop() || 'overview'; render(); }
    if (event.target.matches('[data-logout]')) { currentUser = null; sessionStorage.removeItem('isorre-authenticated'); appShell.classList.add('hidden'); loginScreen.classList.remove('hidden'); }
    const approveButton = event.target.closest('[data-approve]');
    if (approveButton && isHead()) { const account = data.accounts.find(item => item.email === approveButton.dataset.approve); const member = data.members.find(item => (item.email || item.name) === approveButton.dataset.approve); if (account) account.status = 'Active'; if (member) member.status = 'Active'; save(); render(); showToast('Member authenticated by the Clan Head'); }
});
const loginForm = document.getElementById('loginForm');
const signupToggle = document.getElementById('signupToggle');
let signupMode = false;
signupToggle.addEventListener('click', () => { signupMode = !signupMode; loginForm.classList.toggle('signup-mode', signupMode); document.getElementById('loginEyebrow').textContent = signupMode ? 'JOIN THE CLAN' : 'WELCOME BACK'; document.getElementById('loginTitle').textContent = signupMode ? 'Create your clan account' : 'Sign in to your clan office'; document.getElementById('loginCopy').textContent = signupMode ? 'Your account will be reviewed by the Clan Head before records become available.' : 'Members must sign in before viewing clan records.'; document.getElementById('loginSubmit').firstChild.textContent = signupMode ? 'Create account ' : 'Enter the office '; document.getElementById('loginSwitchText').textContent = signupMode ? 'Already have an account?' : 'New to the clan office?'; signupToggle.textContent = signupMode ? 'Sign in instead' : 'Create an account'; document.getElementById('loginHint').textContent = signupMode ? 'Approval is required before access.' : 'Demo access: head@isorre.org / isorre2026'; document.getElementById('loginError').textContent = ''; });
loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(loginForm));
    const error = document.getElementById('loginError');
    if (signupMode) {
        if (data.accounts.some(account => account.email.toLowerCase() === values.email.toLowerCase())) { error.textContent = 'An account with this email already exists.'; return; }
        const account = { name: values.name, email: values.email, password: values.password, role: 'member', status: 'Pending' };
        data.accounts.push(account); data.members.push({ name: values.name, email: values.email, role: 'Member', joined: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), status: 'Pending', initials: initials(values.name) }); save(); currentUser = account; loginScreen.classList.add('hidden'); appShell.classList.remove('hidden'); sessionStorage.setItem('isorre-authenticated', 'true'); sessionStorage.setItem('isorre-email', account.email); render(); showToast('Registration sent to the Clan Head'); return;
    }
    const account = data.accounts.find(item => item.email.toLowerCase() === values.email.toLowerCase() && item.password === values.password);
    if (!account) { error.textContent = 'Email or password is incorrect.'; return; }
    currentUser = account; loginScreen.classList.add('hidden'); appShell.classList.remove('hidden'); sessionStorage.setItem('isorre-authenticated', 'true'); sessionStorage.setItem('isorre-email', account.email); render(); showToast(account.status === 'Pending' ? 'Your account is awaiting approval' : 'Welcome back to the clan office');
});
document.addEventListener('submit', event => { const form = event.target.closest('[data-form]'); if (!form) return; event.preventDefault(); const values = Object.fromEntries(new FormData(form)); const type = form.dataset.form; if (type === 'member') data.members.unshift({ ...values, joined: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), status: 'Active', initials: initials(values.name) }); if (type === 'activity') data.activities.unshift({ ...values, date: values.date ? new Date(`${values.date}T12:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '' }); if (type === 'meeting') { data.meetings.unshift(values); showToast('Meeting notice added for the clan'); } save(); form.closest('[data-modal-backdrop]').remove(); render(); if (type !== 'meeting') showToast(type === 'member' ? 'New member registered' : 'Activity report saved'); });
function uploadPhotos(event) { Array.from(event.target.files).forEach(file => { const reader = new FileReader(); reader.onload = () => { data.photos.unshift({ src: reader.result, caption: file.name.replace(/\.[^/.]+$/, '') }); save(); render(); showToast('Photo added to the gallery'); }; reader.readAsDataURL(file); }); }

if (sessionStorage.getItem('isorre-authenticated') === 'true') { const savedEmail = sessionStorage.getItem('isorre-email') || 'head@isorre.org'; currentUser = data.accounts.find(account => account.email === savedEmail) || data.accounts[0]; loginScreen.classList.add('hidden'); render(); } else { appShell.classList.add('hidden'); }
