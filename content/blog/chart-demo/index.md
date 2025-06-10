---
title: "Exemple de Courbe"
date: 2025-06-10
slug: "exemple-courbe"
draft: false
---

Voici un petit graphique interactif :

{{< chart id="visites" width="600" height="300" >}}
{
  "labels": ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
  "datasets": [{
    "label": "Visites",
    "data": [10, 20, 30, 25, 15, 40],
    "borderColor": "rgb(75, 192, 192)",
    "fill": false,
    "tension": 0.1
  }]
}
{{< /chart >}}

