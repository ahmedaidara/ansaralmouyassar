const chatbotResponses = [
  { keyword: "association", response: "ANSAR ALMOUYASSAR est une association dédiée au développement communautaire et spirituel sous la direction de Mouhamed Niang." },
  { keyword: "membre", response: "Pour voir la liste des membres, consultez la page 'Membres'. Seuls les noms et numéros de membre sont affichés publiquement." },
  { keyword: "cotisation", response: "La cotisation mensuelle est de 2000 FCFA. Vous pouvez payer via Wave ou Orange Money dans votre Espace Personnel." },
  { keyword: "événement", response: "Consultez les événements à venir dans la section 'Événements'. Les membres du bureau peuvent en ajouter dans l'Espace Secret." },
  { keyword: "galerie", response: "La galerie contient des photos et vidéos des événements. Accessible à tous dans la section 'Galerie'." },
  { keyword: "espace personnel", response: "Connectez-vous à votre espace personnel avec votre numéro de membre (ex. : 001) et mot de passe (format JJMMAAAA)." },
  { keyword: "espace secret", response: "L'Espace Secret est réservé aux membres du bureau. Utilisez un code comme ADMIN12301012000 pour y accéder." },
  { keyword: "coran", response: "La section 'Coran' affiche les 30 Juz'. Utilisez la barre de recherche pour trouver un Juz spécifique." },
  { keyword: "suggestion", response: "Vous pouvez soumettre une suggestion dans votre Espace Personnel. Les membres du bureau peuvent les consulter dans l'Espace Secret." },
  { keyword: "bibliothèque", response: "La bibliothèque contient des livres classés par catégories (Fiqh, Hadith, Langue, etc.). Accessible dans la section 'Bibliothèque'." },
  { keyword: "ADMIN12301012000", response: "Veuillez entrer un mot de passe (ex. : JESUISMEMBRE66, JESUISTRESORIER444, PRESIDENT000, SECRETAIRE000)." },
  { keyword: "00000000", response: "Veuillez entrer un mot de passe (ex. : JESUISMEMBRE66, JESUISTRESORIER444, PRESIDENT000, SECRETAIRE000)." },
  { keyword: "11111111", response: "Veuillez entrer un mot de passe (ex. : JESUISMEMBRE66, JESUISTRESORIER444, PRESIDENT000, SECRETAIRE000)." },
  { keyword: "22222222", response: "Veuillez entrer un mot de passe (ex. : JESUISMEMBRE66, JESUISTRESORIER444, PRESIDENT000, SECRETAIRE000)." }
];

function getChatbotResponse(message) {
  const lowerMessage = message.toLowerCase();
  const match = chatbotResponses.find(item => lowerMessage.includes(item.keyword.toLowerCase()));
  return match ? match.response : "Désolé, je n'ai pas compris. Essayez des mots-clés comme 'association', 'membre', 'cotisation', etc.";
}
