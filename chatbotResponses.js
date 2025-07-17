function getChatbotResponse(message) {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('association')) {
    return 'ANSAR ALMOUYASSAR est une association dédiée au développement communautaire et spirituel. Voulez-vous en savoir plus sur nos activités ?';
  } else if (lowerMessage.includes('membre') || lowerMessage.includes('membres')) {
    return 'Pour gérer les membres, connectez-vous à l\'Espace Personnel ou utilisez un code secret pour accéder à l\'Espace Administration.';
  } else if (lowerMessage.includes('cotisation') || lowerMessage.includes('cotisations')) {
    return 'Les cotisations sont gérées dans l\'Espace Personnel pour les membres ou dans l\'Espace Secret pour le Trésorier. Essayez un code comme ADMIN12301012000 pour accéder.';
  } else if (lowerMessage.includes('événement') || lowerMessage.includes('événements')) {
    return 'Consultez les événements dans la section Événements ou gérez-les dans l\'Espace Secret avec un code d\'administration.';
  } else if (lowerMessage.includes('galerie')) {
    return 'La galerie est accessible à tous. Pour ajouter des médias, utilisez un code secret dans l\'Espace Administration.';
  } else if (lowerMessage.includes('coran')) {
    return 'La section Coran contient les 30 Juz\'. Consultez-la dans le menu principal.';
  } else if (lowerMessage.includes('bibliothèque')) {
    return 'La bibliothèque contient des livres islamiques. Consultez-la dans le menu principal.';
  } else if (lowerMessage.includes('suggestion') || lowerMessage.includes('suggestions')) {
    return 'Envoyez vos suggestions via l\'Espace Personnel. Les administrateurs peuvent les consulter dans l\'Espace Secret.';
  } else {
    return 'Je n\'ai pas compris votre demande. Essayez des mots-clés comme "association", "membre", "cotisation", "événement", ou entrez un code secret comme ADMIN12301012000.';
  }
}
