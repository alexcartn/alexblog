
---
title: ""
date: 2024-12-09
type: "page"
---

<section class="mw7 center pa4">
  <h1 class="tc f2 lh-title mb4">Entrons en contact !</h1>

  <!-- Carte formulaire (légère ombre + fond clair) -->
  <article class="bg-near-white br3 pa4 shadow-4">
    <form
      action="https://formspree.io/f/meogdeol"
      method="POST"
      aria-label="Formulaire de contact"
      class="measure-wide center"
    >
      <!-- Nom -->
      <label for="nom" class="f5 b db mb2">Votre nom</label>
      <input
        type="text" id="nom" name="nom"
        class="input-reset ba b--black-20 pa2 br2 mb3 db w-100"
        placeholder="Jean Dupont"
      />
      <!-- Email -->
      <label for="email" class="f5 b db mb2">Votre email <span class="red">*</span></label>
      <input
        type="email" id="email" name="email" required
        class="input-reset ba b--black-20 pa2 br2 mb3 db w-100"
        placeholder="jean@example.com"
      />
      <!-- Sujet (optionnel) -->
      <label for="sujet" class="f5 b db mb2">Sujet</label>
      <input
        type="text" id="sujet" name="sujet"
        class="input-reset ba b--black-20 pa2 br2 mb3 db w-100"
        placeholder="À propos de…"
      />
      <!-- Message -->
      <label for="message" class="f5 b db mb2">Votre message <span class="red">*</span></label>
      <textarea
        id="message" name="message" rows="6" required
        class="input-reset ba b--black-20 pa2 br2 mb4 db w-100"
        placeholder="Votre message…"></textarea>
      <!-- Honeypot anti-spam (invisible) -->
      <input type="text" name="_gotcha" style="display:none" />
      <!-- Redirection après succès -->
      <input type="hidden" name="_next" value="/merci/" />
      <button
        type="submit"
        class="dib pv2 ph4 bg-blue hover-bg-dark-blue white b--none br2 grow pointer"
      >
        Envoyer
      </button>
      <!-- Note RGPD -->
      <p class="f7 silver mt3">
        Les informations saisies resteront confidentielles et ne seront jamais partagées.
      </p>
    </form>
  </article>

<p class="mt4">
  Ou retrouvez-moi sur
  <a href="https://www.linkedin.com/in/alexandre-carton-741146175/"
     target="_blank" rel="noopener">LinkedIn</a>.
</p>

  </div>
