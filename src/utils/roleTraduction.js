const roleMap = {
  admin: "Administrateur",
  player: "Joueur",
  coach: "Entraîneur",
  guest: "Invité",
};

function translateRole(role) {
  return roleMap[role] || "Utilisateur";
}
export default translateRole;
