using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Threading.Tasks;
using GeoCoordinatePortable;
using usersService.Types;

namespace usersService.Schema.Queries
{
    public class Helpers
    {
        public static double GetDistance(LocationType location1, LocationType location2)
        {
            if (location1 != null && location2 != null)
            {
                if (location1.Latitude != 0 && location1.Longitude != 0 && location2.Latitude != 0 && location2.Longitude != 0)
                {
                    var location1Coord = new GeoCoordinate(location1.Latitude, location1.Longitude);
                    var location2Coord = new GeoCoordinate(location2.Latitude, location2.Longitude);
                    return Math.Round(location1Coord.GetDistanceTo(location2Coord) / 1000, 2);
                }
            }
            return -1;
        }

        public static double GetKidsAgeDifference(ICollection<KidType> kids1, ICollection<KidType> kids2)
        {
            if (kids1 != null && kids2 != null && kids1.Count > 0 && kids2.Count > 0)
            {
                double minAgeDifference = double.MaxValue;

                foreach (var kid1 in kids1)
                {
                    foreach (var kid2 in kids2)
                    {
                        double ageDifference = Math.Round(Math.Abs((kid1.Birthday - kid2.Birthday).Value.TotalDays / 365), 2);

                        if (ageDifference < minAgeDifference)
                        {
                            minAgeDifference = ageDifference;
                        }
                    }
                }
                return minAgeDifference;
            }
            return -1;
        }

        public static int GetFavoritePlacesCount(ICollection<LocationType> places1, ICollection<LocationType> places2)
        {
            int numPlaces = 0;
            if (places1 != null && places2 != null && places1.Count > 0 && places2.Count > 0)
            {
                foreach (var place1 in places1)
                {
                    foreach (var place2 in places2)
                    {
                        if (place1.LocationId == place2.LocationId)
                        {
                            numPlaces++;
                        }
                    }
                }
            }
            return numPlaces;
        }

        public static int GetSameLanguageCount(ICollection<LanguageType> langs1, ICollection<LanguageType> langs2)
        {
            int numLangs = 0;
            if (langs1 != null && langs2 != null && langs1.Count > 0 && langs2.Count > 0)
            {
                foreach (var lang1 in langs1)
                {
                    foreach (var lang2 in langs2)
                    {
                        if (lang1.LanguageId == lang2.LanguageId)
                        {
                            numLangs++;
                        }
                    }
                }
            }
            return numLangs;
        }
    }
}