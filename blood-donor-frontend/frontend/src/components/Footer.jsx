const SOCIAL = [
  "fab fa-facebook-f",
  "fab fa-instagram",
  "fab fa-x-twitter",
  "fab fa-linkedin-in",
];

// The tagline differed slightly on each page, so it's a prop.
export default function Footer({ tagline }) {
  return (
    <footer>
      <div className="footer-content">
        <h2>
          <i className="fa-solid fa-droplet"></i>{" "}
          Blood Donor Finder
        </h2>

        <p>{tagline}</p>

        <div className="social-icons">
          {SOCIAL.map((icon) => (
            <a href="#" key={icon} onClick={(e) => e.preventDefault()}>
              <i className={icon}></i>
            </a>
          ))}
        </div>

        <hr />

        <p className="copyright">© 2026 Blood Donor Finder. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
