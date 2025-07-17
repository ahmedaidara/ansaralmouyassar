const chatbotResponses = [
  { keyword: "association", response: "ANSAR ALMOUYASSAR est une association dédiée au développement communautaire et spirituel sous la direction de Mouhamed Niang." },
  { keyword: "membre", response: "Pour voir la liste des membres, consultez la page 'Membres'. Seuls les noms et numéros de membre sont affichés publiquement." },
  { keyword: "cotisation", response: "La cotisation mensuelle est de 2000 FCFA. Vous pouvez payer via Wave ou Orange Money dans la section 'Cotisations'." },
  { keyword: "activité", response: "Consultez les activités à venir dans la section 'Activités'. Les membres du bureau peuvent en ajouter dans l'Espace Secret." },
  { keyword: "galerie", response: "La galerie contient des photos et vidéos des événements. Accessible à tous dans la section 'Galerie'." },
  { keyword: "espace personnel", response: "Connectez-vous à votre espace personnel avec votre prénom, nom, numéro de membre et mot de passe (format JJMMAAAA)." },
  { keyword: "espace secret", response: "L'Espace Secret est réservé aux membres du bureau. Utilisez le code ADMIN123 et le mot de passe 01012000 pour y accéder." },
  { keyword: "coran", response: "La section 'Coran' affiche les 30 Juz'. Utilisez la barre de recherche pour trouver un Juz spécifique." },
  { keyword: "suggestion", response: "Vous pouvez soumettre une suggestion dans votre Espace Personnel. Les membres du bureau peuvent les consulter dans l'Espace Secret." },
  { keyword: "ADMIN12301012000", response: "Veuillez entrer le mot de passe final (JESUISMEMBRE66) pour accéder au coffre-fort." }
];

function getChatbotResponse(message) {
  const lowerMessage = message.toLowerCase();
  const match = chatbotResponses.find(item => lowerMessage.includes(item.keyword.toLowerCase()));
  return match ? match.response : "Désolé, je n'ai pas compris. Essayez des mots-clés comme 'association', 'membre', 'cotisation', etc.";
}
