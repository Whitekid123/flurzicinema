"use client";
import { createContext, useContext } from "react";
import { movies } from "@/data/movies";
import type { Movie } from "@/types/cinema";
const Context=createContext<Movie[]>(movies);
export function CinemaCatalogProvider({ titles,children }:{titles:Movie[];children:React.ReactNode}){return <Context.Provider value={titles}>{children}</Context.Provider>}
export function useMovieCatalog(){return useContext(Context)}
