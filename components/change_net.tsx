import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; // Update with your actual import paths
import { Button } from "./ui/button";
import { Globe } from "lucide-react";
import { useNetwork } from "@/app/NetworkContext";
import { WalletAdapterNetwork } from "@/app/types";

function NetworkDropdown() {
  const { network, setNetwork } = useNetwork();
  const handleNetworkChange = (network: WalletAdapterNetwork) => {
    setNetwork(network);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white text-purple-500 hover:bg-gray-200"
        >
          <Globe className="mr-2 h-4 w-4" />
          {network === WalletAdapterNetwork.Devnet ? "Devnet" : "Mainnet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => handleNetworkChange(WalletAdapterNetwork.Mainnet)}
        >
          Mainnet
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleNetworkChange(WalletAdapterNetwork.Devnet)}
        >
          Devnet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NetworkDropdown;
