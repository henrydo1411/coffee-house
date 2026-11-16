import { Link } from "react-router-dom";
import { Menu } from "./Products";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">A GOOD DAY STARTS HERE</div>
          <h1>
            A fresh brew.
            <br />A better day.
          </h1>
          <p>
            Take a little break. Find your favorite coffee, a refreshing tea, or
            something sweet to brighten your day.
          </p>
          <a className="btn btn-cream" href="#menu">
            Find your favorite ↗
          </a>
          <div className="hero-caption">
            BREWED WITH CARE · ENJOYED AT YOUR PACE
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="coffee-orbit" />
          <div className="coffee-cup">
            <span>
              COFFEE
              <br />
              HOUSE
            </span>
          </div>
          <div className="hero-stamp">
            FRESH
            <br />& LOVELY
          </div>
          <span className="floating-bean bean-one" />
          <span className="floating-bean bean-two" />
        </div>
      </section>
      <div className="benefits">
        <span>01 / Carefully selected ingredients</span>
        <span>02 / Made your way</span>
        <span>03 / A moment worth enjoying</span>
      </div>
      <Menu compact />
      <section className="visit-banner">
        <div>
          <div className="eyebrow">YOUR NEXT LITTLE TREAT</div>
          <h2>Good things come in a coffee cup.</h2>
          <p className="mb-0">
            Choose your size, sweetness and favorite topping.
          </p>
        </div>
        <Link to="/products" className="btn btn-dark">
          Explore the menu →
        </Link>
      </section>
    </>
  );
}
