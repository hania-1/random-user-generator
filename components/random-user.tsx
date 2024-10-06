"use client"; // Enables client-side rendering for this component

import { useState, useEffect, useCallback } from "react"; // Import necessary hooks from React
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; // Import custom Card components
import { Button } from "@/components/ui/button"; // Import custom Button component
import ClipLoader from "react-spinners/ClipLoader"; // Loader for the loading state
import Image from "next/image"; // Import Next.js Image component
import { MailIcon, MapPinIcon, UserIcon, StarIcon } from "lucide-react"; // Import icons from lucide-react

// Define the User interface
interface User {
  name: string;
  email: string;
  address: string;
  image: string;
  gender: string; // Added gender
}

const RandomUser: React.FC = () => {
  const [user, setUser] = useState<User | null>(null); // State to manage the fetched user
  const [loading, setLoading] = useState<boolean>(false); // State to manage the loading state
  const [error, setError] = useState<string | null>(null); // State to manage error messages
  const [userHistory, setUserHistory] = useState<User[]>([]); // State to manage user history
  const [favorites, setFavorites] = useState<User[]>([]); // State to manage favorite users
  const [searchTerm, setSearchTerm] = useState<string>(""); // State for search term

  // Fetch saved user history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("userHistory");
    if (savedHistory) {
      setUserHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save user history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("userHistory", JSON.stringify(userHistory));
  }, [userHistory]);

  // Function to fetch a random user
  const fetchRandomUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://randomuser.me/api/");
      const data = await response.json();
      const fetchedUser = data.results[0];
      const newUser: User = {
        name: `${fetchedUser.name.first} ${fetchedUser.name.last}`,
        email: fetchedUser.email,
        address: `${fetchedUser.location.street.number} ${fetchedUser.location.street.name}, ${fetchedUser.location.city}, ${fetchedUser.location.country}`,
        image: fetchedUser.picture.large,
        gender: fetchedUser.gender, // Get the gender of the user
      };
      setUser(newUser);
      setUserHistory((prev) => [...prev, newUser]); // Add new user to history
    } catch (err) {
      console.error(err); // Log the error to the console
      setError("Failed to fetch user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch a random user when the component mounts
  useEffect(() => {
    fetchRandomUser();
  }, []);

  // Copy user information to clipboard
  const copyUserInfo = () => {
    if (user) {
      const userInfo = `Name: ${user.name}\nEmail: ${user.email}\nAddress: ${user.address}`;
      navigator.clipboard.writeText(userInfo);
      alert("User information copied to clipboard!");
    }
  };

  // Handle favoriting a user
  const toggleFavorite = useCallback((userToFavorite: User) => {
    if (favorites.includes(userToFavorite)) {
      setFavorites(favorites.filter((fav) => fav !== userToFavorite));
    } else {
      setFavorites([...favorites, userToFavorite]);
    }
  }, [favorites]);

  // Clear user history
  const clearHistory = () => {
    setUserHistory([]);
  };

  // Handle search input
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filtered history based on search term
  const filteredHistory = userHistory.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // JSX return statement rendering the Random User UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-black">
      <h1 className="text-3xl font-bold mb-4">Random User Generator</h1>
      <Button onClick={fetchRandomUser} className="mb-6">
        Fetch New User
      </Button>

      <input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4 p-2 border border-gray-300 rounded"
      />

      {loading && (
        <div className="flex items-center justify-center">
          <ClipLoader className="w-6 h-6 mr-2" />
          <span>Loading...</span>
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
      {user && (
        <Card className="border-0 shadow-lg rounded-lg overflow-hidden max-w-sm relative">
          <CardHeader className="h-32 bg-gray-400 relative">
            <Image
              src={user.image}
              alt={user.name}
              width={80}
              height={80}
              className="rounded-full border-4 border-white absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2"
              onError={(e) => {
                e.currentTarget.src = "/path/to/placeholder-image.jpg"; // Placeholder image
              }}
            />
          </CardHeader>
          <CardContent className="p-6 pt-12 text-center bg-gray-300">
            <CardTitle className="text-xl font-bold flex items-center justify-center">
              <UserIcon className="mr-2" /> {user.name}
              <Button
                variant="outline"
                className="ml-2"
                onClick={() => toggleFavorite(user)}
              >
                <StarIcon className={`w-4 h-4 ${favorites.includes(user) ? 'text-yellow-500' : 'text-gray-400'}`} />
              </Button>
            </CardTitle>
            <CardDescription className="text-muted-foreground flex items-center justify-center">
              <MailIcon className="mr-2" /> {user.email}
            </CardDescription>
            <div className="text-sm text-muted-foreground mt-2 flex items-center justify-center">
              <MapPinIcon className="mr-2" /> {user.address}
            </div>
            <div className="text-sm text-muted-foreground mt-2 flex items-center justify-center">
              <strong>Gender: </strong> {user.gender}
              {/* Display user gender with an optional icon */}
              {user.gender === "male" ? <span className="ml-2">👨</span> : <span className="ml-2">👩</span>}
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={copyUserInfo}
            >
              Copy Info
            </Button>
          </CardContent>
        </Card>
      )}
      <h2 className="mt-6 text-xl font-bold">User History</h2>
      <ul className="list-disc">
        {filteredHistory.map((u, index) => (
          <li key={index}>
            {u.name} 
            <Button variant="link" onClick={() => toggleFavorite(u)}>
              {favorites.includes(u) ? "Unfavorite" : "Favorite"}
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="outline" onClick={clearHistory} className="mt-4 hover:bg-gray-400">
        Clear History
      </Button>
      {favorites.length > 0 && (
        <>
          <h2 className="mt-6 text-xl font-bold">Favorite Users</h2>
          <ul className="list-disc">
            {favorites.map((u, index) => (
              <li key={index}>{u.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default RandomUser;
